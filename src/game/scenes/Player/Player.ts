import { GameObjects, Scene, Math as PhaserMath } from "phaser";

export class Player {
    rect: GameObjects.Rectangle;
    speed = 220;
    direction = new PhaserMath.Vector2(0, 0);
    targetPosition = new PhaserMath.Vector2(0, 0);
    constructor(scene: Scene, x: number, y: number) {
        this.createBody(scene, x, y);
    }
    createBody(scene: Scene, x: number, y: number) {
        this.rect = scene.add.rectangle(x, y, 50, 50, 0x0000ff);
    }
    setPosition(x: number, y: number) {
        this.rect.setPosition(x, y);
    }

    // This is a very basic input handler that sets the direction vector based on the input received.//

    handleInput(input: {
        up: boolean;
        down: boolean;
        left: boolean;
        right: boolean;
    }) {
        this.direction.set(0, 0);
        if (input.up) {
            this.direction.y = -1;
        }
        if (input.down) {
            this.direction.y = 1;
        }
        if (input.left) {
            this.direction.x = -1;
        }
        if (input.right) {
            this.direction.x = 1;
        }
    }

    update(deltaTime: number) {
        // Assuming a fixed time step for simplicity
        if (this.direction.length() > 0) {
            this.direction.normalize();
            const dt = deltaTime / 1000; // Convert ms to seconds
            this.rect.x += this.direction.x * this.speed * dt;
            this.rect.y += this.direction.y * this.speed * dt;
        }
    }
}

