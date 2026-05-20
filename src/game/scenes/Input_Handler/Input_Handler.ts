import { Input, Math, Scene } from "phaser";
import { SocketInputData } from "../../../Connection/Connection";
import { Player } from "../Player/Player";

export class InputHandler {
    private socket: WebSocket;
    private inputSequenceNumber: number;
    inputBuffer: { data: SocketInputData; delta: number }[];
    scene: Scene;
    leftKey: any;
    rightKey: any;
    upKey: any;
    downKey: any;

    constructor(scene: Scene, socket: WebSocket) {
        this.scene = scene;
        this.socket = socket;
        this.inputSequenceNumber = 0;
        this.inputBuffer = [];
        this.createInputListeners();
    }

    createInputListeners() {
        if (this.scene.input.keyboard) {
            this.leftKey = this.scene.input.keyboard.addKey(
                Input.Keyboard.KeyCodes.A,
            );
            this.rightKey = this.scene.input.keyboard.addKey(
                Input.Keyboard.KeyCodes.D,
            );
            this.upKey = this.scene.input.keyboard.addKey(
                Input.Keyboard.KeyCodes.W,
            );
            this.downKey = this.scene.input.keyboard.addKey(
                Input.Keyboard.KeyCodes.S,
            );
        }
    }

    sendInput(localPlayerId: Player, delta: number) {
        const input = {
            up: this.upKey.isDown,
            down: this.downKey.isDown,
            left: this.leftKey.isDown,
            right: this.rightKey.isDown,
        };
        localPlayerId.handleInput(input);

        const inputData = {
            type: "input",
            seq: this.inputSequenceNumber++,
            ...input,
        };

        this.socket.send(JSON.stringify(inputData));
        this.inputBuffer.push({ data: inputData, delta });
    }

    replayInputs(inputData: SocketInputData) {
        let direction = new Math.Vector2(0, 0);
        if (inputData.up) {
            direction.y = -1;
        }
        if (inputData.down) {
            direction.y = 1;
        }
        if (inputData.left) {
            direction.x = -1;
        }
        if (inputData.right) {
            direction.x = 1;
        }
        return direction.normalize();
    }
    update(direction: Math.Vector2, target: Math.Vector2, delta: number) {
        // Assuming a fixed time step for simplicity
        if (direction.length() > 0) {
            direction.normalize();
            const dt = delta / 1000; // Convert ms to seconds
            target.x += direction.x * 220 * dt;
            target.y += direction.y * 220 * dt;
        }
    }
}

