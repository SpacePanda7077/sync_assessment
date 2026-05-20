import { useMutation } from "@tanstack/react-query";
import { getUser } from "../Axios/Auth";

export const useAuth = () => {
    const {
        data: user,
        error,
        mutate: getUserData,
    } = useMutation({
        mutationKey: ["getUser"], // Add a random value to ensure the mutation runs every time
        mutationFn: () => getUser(),
    });

    return { user, error, getUserData };
};

