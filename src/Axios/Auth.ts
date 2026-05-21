import axios from "axios";

const HttP_URL = import.meta.env.VITE_HTTP_URL;

const getUser = async () => {
    try {
        const baseURL = HttP_URL || "/api"; // fallback to proxy in dev
        const response = await axios.post(`${baseURL}/login`, {
            username: "test1",
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export { getUser };

