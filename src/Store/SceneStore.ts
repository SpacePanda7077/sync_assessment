import { create } from "zustand";

type SceneState = {
    currentScene: Phaser.Scene | null;
    setCurrentScene: (scene: Phaser.Scene) => void;
};

// Zustand store for managing the current Phaser scene
export const useSceneStore = create<SceneState>()((set) => ({
    currentScene: null,
    setCurrentScene: (scene: Phaser.Scene) => set({ currentScene: scene }),
}));
