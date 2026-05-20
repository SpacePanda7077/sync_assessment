import { create } from "zustand";

type AuthState = {
    user: { id: string; username: string }; // You can replace 'any' with a specific user type
    setUserData: (userData: { id: string; username: string }) => void;
};

// Zustand store for managing user authentication data
export const useAuthStore = create<AuthState>()((set) => ({
    user: { id: "generated-player-id", username: "player_name" }, // Initial user data
    setUserData: (userData: { id: string; username: string }) =>
        set({ user: userData }),
}));

