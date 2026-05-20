import axios from "axios";

const HttP_URL = import.meta.env.VITE_HTTP_URL;

const getUser = async () => {
    try {
        const response = await axios.post(`/api/login`, {
            username: "test1",
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export { getUser };

