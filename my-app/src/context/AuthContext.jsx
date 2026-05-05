import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("userData");

        if (token && storedUser) {
            try {
                // ✅ ЗАСВАР 1: Token-ны payload-г decode хийж expire шалгах
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isExpired = payload.exp && payload.exp * 1000 < Date.now();

                if (isExpired) {
                    // Token хугацаа дууссан бол цэвэрлэх
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("userData");
                } else {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Auth init error:", e);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userData");
            }
        }
        setLoading(false);
    }, []);

    const handleSignIn = (userData, token) => {
        if (!token) {
            console.error("Token байхгүй байна!");
            return;
        }
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
    };

    const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        setUser(null);
    };

    const getToken = () => localStorage.getItem("accessToken");

    // ✅ ЗАСВАР 2: Loading үед spinner харуулах (хоосон хуудас биш)
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '16px',
                color: '#888'
            }}>
                Уншиж байна...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            signIn: handleSignIn,
            signOut: handleSignOut,
            getToken,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);