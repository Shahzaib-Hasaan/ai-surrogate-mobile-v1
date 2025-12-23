import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'nativewind';
import { UserContext as UserContextType } from '../types';
import { db } from '../services/db';

interface UserContextProps {
    userContext: UserContextType;
    setUserContext: (ctx: UserContextType) => void;
    isLoading: boolean;
    updateContext: (newCtx: Partial<UserContextType>) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setColorScheme } = useColorScheme();
    const [userContext, setUserContextState] = useState<UserContextType>({
        name: '',
        preferredLanguage: 'en',
        hasSeenIntro: false,
        theme: 'dark' // Default to dark for Web3 vibe
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadContext = async () => {
            const savedContext = await db.getUserContext();
            // Force dark look if desired or respect saved. 
            // For Web3 vibe, we might want to default to dark if not set, but let's respect saved.
            if (savedContext) {
                setUserContextState(savedContext);
                setColorScheme(savedContext.theme || 'dark');
            } else {
                setColorScheme('dark');
            }
            setIsLoading(false);
        };
        loadContext();
    }, []);

    const updateContext = async (newCtx: Partial<UserContextType>) => {
        const updated = { ...userContext, ...newCtx };
        setUserContextState(updated);

        if (newCtx.theme) {
            setColorScheme(newCtx.theme);
        }

        await db.saveUserContext(updated);
    };

    return (
        <UserContext.Provider value={{ userContext, setUserContext: setUserContextState, isLoading, updateContext }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
