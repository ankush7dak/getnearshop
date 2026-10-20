import { createContext, useState, useEffect } from "react";
import { LINKS } from "../../constants/LinksUtility";
import axios from "axios";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading,setLoading] = useState(true);
    useEffect(() => {
        axios.get(`${LINKS.API_BASE_URL}/auth/getUserRole`, {
            withCredentials: true
        })
            .then(res => {
                setUser(res.data);
            })
            .catch(() => {
                setUser(null);
            }) .finally(() => {
      setLoading(false);
    });
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser ,loading}}>
            {children}
        </AuthContext.Provider>
    );
};
