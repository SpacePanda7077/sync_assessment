import { useMutation } from "@tanstack/react-query";
import { getUser } from "../Axios/Auth";

export const useAuth = () => {
    const {
        data: user,
        error,
        mutate: getUserData,
    } = useMutation({
        mutationKey: ["getUser"],
        mutationFn: (username: string) => getUser(username),
    });

    return { user, error, getUserData };
};

