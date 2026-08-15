import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {

            setUser({
                id: localStorage.getItem("userId"),
                name: localStorage.getItem("userName"),
                email: localStorage.getItem("userEmail"),
                role: localStorage.getItem("userRole"),
            });

        }

    }, []);

    const login = (userData) => {

        localStorage.setItem("token", userData.token);
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userRole", userData.role);

        setUser(userData);

    };

    const logout = () => {

        localStorage.clear();

        setUser(null);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}