import { createContext, useContext, useState } from "react";

const StateContext = createContext({
    user: null,
    cliente: null,
    token: null,
    setUser: () => { },
    setCliente: () => { },
    setToken: () => { },
    notificationCount: 0,
    setNotificationCount: () => { },
    theme: {},
    setTheme: () => { },
});

const defaultTheme = {
    sidebarColor: 'indigo',
    mode: 'light',
};

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [cliente, setCliente] = useState({});
    const [token, _setToken] = useState(localStorage.getItem('CLIENT_ACCESS_TOKEN'));
    const [notificationCount, setNotificationCount] = useState(0);
    const [theme, _setTheme] = useState(() => {
        const saved = localStorage.getItem('CLIENT_THEME');
        return saved ? JSON.parse(saved) : defaultTheme;
    });

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('CLIENT_ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('CLIENT_ACCESS_TOKEN');
        }
    };

    const setTheme = (newTheme) => {
        const merged = { ...theme, ...newTheme };
        _setTheme(merged);
        localStorage.setItem('CLIENT_THEME', JSON.stringify(merged));
    };

    return (
        <StateContext.Provider value={{
            user,
            cliente,
            token,
            setUser,
            setCliente,
            setToken,
            notificationCount,
            setNotificationCount,
            theme,
            setTheme,
        }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
