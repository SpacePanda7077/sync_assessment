const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
    ? "/api"
    : "https://api.allorigins.win/get?url=http://92.205.187.214:8080";

export const WS_BASE_URL = isDev ? "" : "ws://92.205.187.214:8080";

