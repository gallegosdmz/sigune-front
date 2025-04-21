import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    loginUser: ( token: string ) => void;
    logout: () => void;
}

export const AuthContext = createContext< AuthContextType >({
    isAuthenticated: false,
    loading: true,
    loginUser: () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC< AuthProviderProps > = ({ children }) => {
    const [ isAuthenticated, setIsAuthenticated ] = useState< boolean >( false );
    const [ loading, setLoading ] = useState< boolean >( true );

    useEffect(() => {
        const token = localStorage.getItem('token');

        if ( token ) {
            setIsAuthenticated( true );
        } else {
            setIsAuthenticated( false );
        }

        setLoading( false );
    }, []);

    const loginUser = ( token: string ) => {
        localStorage.setItem('token', token);
        setIsAuthenticated( true );
    };

    const logout = async() => {

    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, loginUser, logout }}>
            { children }   
        </AuthContext.Provider>
    );
    
}