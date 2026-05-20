import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game, Scale, Types } from "phaser";
import { Menu } from "./scenes/Menu";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    scale: {
        mode: Scale.ScaleModes.FIT,
        autoCenter: Scale.Center.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [Menu, MainGame],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
