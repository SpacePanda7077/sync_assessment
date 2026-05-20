import { create } from "zustand";

type ConnectionState = {
    socket: WebSocket | null;
    connect: (url: string) => void;
    disconnect: () => void;
};

export type SocketRecievedData = {
    type: string;
    playerId: string;
    lastProcessedInputSeq: number;
    players: {
        id: string;
        x: number;
        y: number;
    }[];
};

export type SocketInputData = {
    type: string;
    seq: number;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
};

// Zustand store for managing WebSocket connection
export const useConnectionStore = create<ConnectionState>()((set) => ({
    socket: null,
    connect: (url: string) => {
        const socket = new WebSocket(url);
        set({ socket });
    },
    disconnect: () => set({ socket: null }),
}));

