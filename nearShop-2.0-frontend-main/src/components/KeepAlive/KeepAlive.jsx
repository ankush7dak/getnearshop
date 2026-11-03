
import { useEffect } from "react";
import axios from "axios";
import { LINKS } from "../../constants/LinksUtility";

const KeepAlive = () => {

    useEffect(() => {

        const API_URL =LINKS.API_BASE_URL;

        const sendRequest = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/customer/healthStatus`,
                    { timeout: 20000 }
                );

                console.log(
                    "NearShop server is active:",
                    response.status
                );

            } catch (error) {
                console.error(
                    "Keep-alive request failed:",
                    error.message
                );
            }
        };

        // Send first request immediately
        sendRequest();

        // Repeat every 7 minutes
        const interval = setInterval(
            sendRequest,
            7 * 60 * 100
        );

        return () => clearInterval(interval);

    }, []);

    return null;
};

export default KeepAlive;
