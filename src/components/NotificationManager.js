import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useCallback } from 'react';
import NotificationToast from './NotificationToast';
export const NotificationContext = React.createContext({
    showNotification: () => { }
});
export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const showNotification = useCallback((notification) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newNotification = {
            ...notification,
            id
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);
    return (_jsxs(NotificationContext.Provider, { value: { showNotification }, children: [children, _jsx("div", { style: { position: 'fixed', top: 0, right: 0, zIndex: 10000, pointerEvents: 'none' }, children: notifications.map((notification, index) => (_jsx("div", { style: {
                        position: 'absolute',
                        top: `${20 + index * 100}px`,
                        right: '20px',
                        pointerEvents: 'auto'
                    }, children: _jsx(NotificationToast, { ...notification, onClose: removeNotification }) }, notification.id))) })] }));
};
export default NotificationProvider;
