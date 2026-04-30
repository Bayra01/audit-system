import React, { createContext, useState, useEffect, useContext } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Апп ачаалах бүрт LocalStorage-оос шалгах
        const storedUser = localStorage.getItem("username");
        const storedRole = localStorage.getItem("role");
        const token = localStorage.getItem("accessToken");
        if (storedUser && token) {
            setUser({ username: storedUser, role: storedRole });
        }
        setLoading(false);
    }, []);
    // 1. login функцыг handleSignIn болгож өөрчлөн accessToken-той нэгтгэв
    const handleSignIn = (userData, token) => {
        if (!token) {
            console.error("Token байхгүй байна!");
            return;
        }
        // Мэдээллүүдийг нэг дор хадгалах
        localStorage.setItem("accessToken", token);
        localStorage.setItem("username", userData.username);
        localStorage.setItem("role", userData.role || "User");
        setUser({
            username: userData.username,
            role: userData.role || "User"
        });
    };

    // 2. handleSignOut (Гарах функц)
    const handleSignOut = () => {
        localStorage.clear();
        setUser(null);
    };

    // 3. getToken функц нэмэв (Бусад газар токен хэрэг болбол ашиглана)
    const getToken = () => {
        return localStorage.getItem("accessToken");
    };

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