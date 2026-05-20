import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Menu extends Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("star", "star.png");
        this.load.image("background", "bg.png");
        this.load.image("logo", "logo.png");
    }

    create() {
        const { width, height } = this.scale;
        this.add.image(width / 2, 250, "logo").setDepth(100);
        this.add
            .text(width / 2, 350, "Menu Scene", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        EventBus.emit("current-scene-ready", this);
    }
}
