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
    networkBreathingSpace = 20;
    desyncThreshold = 50 + this.networkBreathingSpace; // pixels
    snapshotQueue: SocketRecievedData[] = [];
    lastAckedSeq = -1;
    serverViewer: GameObjects.Rectangle;

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
        this.serverViewer = this.add
            .rectangle(0, 0, 70, 70, 0xff0000)
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
                this.snapshotQueue.push(data);
            };
        };

        EventBus.emit("current-scene-ready", this);
    }

    update(time: number, delta: number): void {
        this.elapsedTime += delta;
        while (this.elapsedTime >= this.tickRate) {
            this.elapsedTime -= this.tickRate;
            this.fixedUpdate();
        }
        for (const player of this.frontendPlayers.values()) {
            const visual = player.rect;
            const target = player.predictedPosition;

            let factor: number;

            if (player === this.localPlayer) {
                factor = 0.035;
                continue; // Much more responsive
                // Alternative (very popular): factor = 0.35; // constant
            } else {
                factor = 0.08; // remote players
                visual.x = PhaserMath.Linear(visual.x, target.x, factor);
                visual.y = PhaserMath.Linear(visual.y, target.y, factor);
            }
        }
    }

    fixedUpdate() {
        // Consume snapshot first — this is what creates localPlayer
        while (this.snapshotQueue.length > 0) {
            this.applySnapshot(this.snapshotQueue.shift()!);
        }

        if (!this.localPlayer) return; // now safe to guard the rest

        this.input_handler.sendInput(this.localPlayer, this.tickRate);
        this.localPlayer.update(this.tickRate);
    }

    getError(
        localPosition: { x: number; y: number },
        serverPosition: { x: number; y: number },
    ) {
        const errorX = serverPosition.x - localPosition.x;
        const errorY = serverPosition.y - localPosition.y;
        return Math.sqrt(errorX * errorX + errorY * errorY);
    }
    applySnapshot(data: SocketRecievedData) {
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
                    // serverViewer.setPosition(player.x, player.y);
                }
            } else {
                // If we already have this player in our frontend map, it means it's an existing player that has updated their position, so we update their Player object with the new position data from the server

                const playerObj = this.frontendPlayers.get(player.id);
                if (!playerObj) continue;
                if (player.id === data.playerId) {
                    const serverPos = new PhaserMath.Vector2(
                        player.x,
                        player.y,
                    );
                    // Find the index of the last acknowledged input in the input buffer
                    const acknowledgedIndex =
                        this.input_handler.inputBuffer.findIndex(
                            (input) =>
                                input.data.seq === data.lastProcessedInputSeq,
                        );

                    if (acknowledgedIndex !== -1) {
                        if (data.lastProcessedInputSeq === this.lastAckedSeq) {
                            console.log(
                                "Duplicate snapshot received, ignoring.",
                            );
                            continue;
                        }
                        // Remove acknowledged inputs
                        this.input_handler.inputBuffer.splice(
                            0,
                            acknowledgedIndex + 1,
                        );
                        this.lastAckedSeq = data.lastProcessedInputSeq;

                        // Replay remaining inputs
                        this.input_handler.inputBuffer.forEach((input) => {
                            const direction = this.input_handler.replayInputs(
                                input.data,
                            );
                            this.input_handler.update(
                                direction,
                                serverPos,
                                input.delta,
                            );
                        });

                        this.serverViewer.setPosition(serverPos.x, serverPos.y);
                        const currentPos = {
                            x: this.localPlayer.rect.x,
                            y: this.localPlayer.rect.y,
                        };

                        // Calculate the error between the client's predicted position and the server's authoritative position
                        const error = this.getError(currentPos, serverPos);
                        console.log("Error : ", error);
                        // If the error exceeds the desync threshold, we correct the client's position to match the server's position
                        if (error > this.desyncThreshold) {
                            console.log(
                                "Desync detected! Correcting position.",
                            );
                            this.localPlayer.setPosition(
                                serverPos.x,
                                serverPos.y,
                            );
                        }
                    }
                } else {
                    // Remote players
                    playerObj.predictedPosition.set(player.x, player.y); // or better: predictedPosition
                }
            }
        }
    }
}
