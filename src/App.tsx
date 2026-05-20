import { useCallback, useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";

import { useConnectionStore } from "./Connection/Connection";

import { EventBus } from "./game/EventBus";
import { Scene } from "phaser";
import { useSceneStore } from "./Store/SceneStore";
import { useAuth } from "./Hooks/useAuth";
import { useAuthStore } from "./Store/AuthStore";
import "./App.css";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const socket = useConnectionStore((state) => state.socket);
    const connect = useConnectionStore((state) => state.connect);
    const currentScene = useSceneStore((state) => state.currentScene);
    const setCurrentScene = useSceneStore((state) => state.setCurrentScene);
    const setUser = useAuthStore((state) => state.setUserData);
    const [username, setUsername] = useState("");

    const { getUserData, user } = useAuth();
    const getUserInfo = useCallback(() => {
        if (!username) {
            alert("Please enter a username");
            return;
        }
        getUserData(username);
    }, [username]);

    useEffect(() => {
        if (user) {
            console.log("User data received:", user);
            setUser({ id: user.id, username: user.username });

            connect(`ws://92.205.187.214:8080/ws?playerId=${user.id}`);
        }
    }, [user]);

    useEffect(() => {
        if (currentScene && socket) {
            if (currentScene.scene.key !== "Menu") {
                console.warn(
                    "Current scene is not 'Menu'. Cannot start the game scene.",
                );
                return;
            }
            console.log("Current scene is ready:", currentScene.scene.key);
            console.log("WebSocket connection status:", socket.readyState);
            currentScene.scene.start("Game", { socket });
        }
    }, [currentScene, socket]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (data: Scene) => {
            setCurrentScene(data);
        });
        return () => {
            EventBus.off("current-scene-ready");
        };
    }, []);

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <div>
                {currentScene?.scene.key === "Menu" && (
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <button className="button" onClick={getUserInfo}>
                            Join Room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
