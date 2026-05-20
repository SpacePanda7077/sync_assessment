import axios from "axios";

import { API_BASE_URL } from "../lib/api";

const getUser = async (username: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
            username,
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export { getUser };

