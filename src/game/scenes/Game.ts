import { GameObjects, Scene, Math as PhaserMath } from "phaser";
import { EventBus } from "../EventBus";
import { SocketRecievedData } from "../../Connection/Connection";
import { InputHandler } from "./Input_Handler/Input_Handler";

import { Player } from "./Player/Player";

export class Game extends Scene {
    socket: WebSocket;
    frontendPlayers = new Map<string, Player>();
    localPlayer: Player;
    input_handler: InputHandler;
    tickRate = 1000 / 20;
    pastTime = 0;
    elapsedTime = 0;
    networkBreathingSpace = 10;
    desyncThreshold = 50 + this.networkBreathingSpace; // pixels

    constructor() {
        super("Game");
    }

    init(data: { socket: WebSocket }) {
        console.log("Game scene initialized with data:", data);
        this.socket = data.socket;
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("star", "star.png");
        this.load.image("background", "bg.png");
        this.load.image("logo", "logo.png");
    }

    create() {
        this.cameras.main.setZoom(0.4);
        this.input_handler = new InputHandler(this, this.socket);
        // a debug rectangle to visualize the server position of the player, this will help us see the error between client and server positions
        const serverViewer = this.add
            .rectangle(0, 0, 50, 50, 0xff0000)
            //set the visible to true to visualize the server position
            .setVisible(false);

        // Listen for WebSocket events
        this.socket.onopen = () => {
            console.log("WebSocket connection opened:", this.socket);

            this.socket.onclose = (event) => {
                console.log("WebSocket connection closed:", event);
            };

            this.socket.onmessage = (event) => {
                const data: SocketRecievedData = JSON.parse(event.data);

                for (const player of data.players) {
                    if (!this.frontendPlayers.has(player.id)) {
                        // If we don't have this player in our frontend map, it means it's a new player that joined the game, so we create a new Player object for them

                        const playerObj = new Player(this, player.x, player.y);
                        this.frontendPlayers.set(player.id, playerObj);

                        // If this player is the local player, we set up the camera to follow them and store a reference to their Player object for input handling

                        if (player.id === data.playerId) {
                            this.cameras.main.startFollow(playerObj.rect);
                            playerObj.rect.setFillStyle(0x00ff00);
                            this.localPlayer = playerObj;
                            serverViewer.setPosition(player.x, player.y);
                        }
                    } else {
                        // If we already have this player in our frontend map, it means it's an existing player that has updated their position, so we update their Player object with the new position data from the server

                        const playerObj = this.frontendPlayers.get(player.id);
                        if (!playerObj) continue;
                        if (player.id === data.playerId) {
                            const serverPosition = { x: player.x, y: player.y };

                            // splice the input buffer to remove acknowledged inputs
                            this.spliceInputBuffer(data.lastProcessedInputSeq);

                            // Reset to authoritative server position
                            playerObj.targetPosition.set(
                                serverPosition.x,
                                serverPosition.y,
                            );

                            // Replay unacknowledged inputs
                            for (const input of this.input_handler
                                .inputBuffer) {
                                const direction =
                                    this.input_handler.replayInputs(input.data);
                                this.input_handler.update(
                                    direction,
                                    playerObj.targetPosition,
                                    input.delta,
                                );
                            }
                            serverViewer.setPosition(
                                serverPosition.x,
                                serverPosition.y,
                            );

                            // Calculate the error between the client's current position and the server's authoritative position
                            const error = this.getError(
                                {
                                    x: playerObj.rect.x,
                                    y: playerObj.rect.y,
                                },
                                serverPosition,
                            );
                            // If the error exceeds our desync threshold, we snap the player back to the server's authoritative position to prevent them from getting too far out of sync this helps with inconsistent packet loss or latency spikes,
                            if (error > this.desyncThreshold) {
                                console.log(
                                    `Position error: ${error.toFixed(2)} pixels`,
                                );
                                playerObj.setPosition(
                                    serverPosition.x,
                                    serverPosition.y,
                                );
                            }
                        } else {
                            // For other players, we can use linear interpolation to smoothly move them to their new positions
                            const linearInterpolationFactor = 0.2;
                            const localPosition = {
                                x: playerObj.rect.x,
                                y: playerObj.rect.y,
                            };
                            const interPolatedPosition = {
                                x: PhaserMath.Linear(
                                    localPosition.x,
                                    player.x,
                                    linearInterpolationFactor,
                                ),
                                y: PhaserMath.Linear(
                                    localPosition.y,
                                    player.y,
                                    linearInterpolationFactor,
                                ),
                            };
                            playerObj.setPosition(
                                interPolatedPosition.x,
                                interPolatedPosition.y,
                            );
                        }
                    }
                }
            };
        };

        EventBus.emit("current-scene-ready", this);
    }

    update(time: number, delta: number): void {
        // In a more Real Scenero we would use a fixed update for great determinism between client and server, but for simplicity we will just send input on key events
        // handling input and sending it to the server would be done here,
        this.elapsedTime += delta;
        while (this.elapsedTime >= this.tickRate) {
            this.elapsedTime -= this.tickRate;
            this.fixedUpdate();
        }
    }

    fixedUpdate() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            if (this.localPlayer) {
                this.input_handler.sendInput(this.localPlayer, this.tickRate);
                this.localPlayer.update(this.tickRate);
                const interPolatedPosition = {
                    x: PhaserMath.Linear(
                        this.localPlayer.rect.x,
                        this.localPlayer.targetPosition.x,
                        0.2,
                    ),
                    y: PhaserMath.Linear(
                        this.localPlayer.rect.y,
                        this.localPlayer.targetPosition.y,
                        0.4,
                    ),
                };
                this.localPlayer.setPosition(
                    interPolatedPosition.x,
                    interPolatedPosition.y,
                );
            }
        }
    }

    spliceInputBuffer(seq: number) {
        this.input_handler.inputBuffer = this.input_handler.inputBuffer.filter(
            (input) => input.data.seq > seq,
        );
    }

    getError(
        localPosition: { x: number; y: number },
        serverPosition: { x: number; y: number },
    ) {
        const errorX = serverPosition.x - localPosition.x;
        const errorY = serverPosition.y - localPosition.y;
        return Math.sqrt(errorX * errorX + errorY * errorY);
    }
}
