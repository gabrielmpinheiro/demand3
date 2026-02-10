import { createContext, useContext, useState } from "react";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
    notificationCount: 0,
    setNotificationCount: () => { },
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [notificationCount, setNotificationCount] = useState(0);

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN');
        }
    }

    return (
        <StateContext.Provider value={{
            user,
            token,
            setUser,
            setToken,
            notificationCount,
            setNotificationCount
        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);
