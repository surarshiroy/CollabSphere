import api from "../api/axios";

export const wakeUpBackend = async () => {

    try {

        await api.get("/health");

        return true;

    } catch (error) {

        console.log("Backend is waking up...");

        return false;

    }

};