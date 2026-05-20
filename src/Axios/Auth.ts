import axios from "axios";

const HttP_URL = import.meta.env.VITE_HTTP_URL;

const getUser = async (username: string) => {
    try {
        const response = await axios.post(`/api/login`, {
            username: username,
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export { getUser };

