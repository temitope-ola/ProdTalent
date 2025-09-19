import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
const NotFoundPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const handleGoToDashboard = () => {
        if (user) {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
        else {
            navigate('/', { replace: true });
        }
    };
    const handleGoHome = () => {
        navigate('/', { replace: true });
    };
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, children: _jsxs("div", { style: {
                width: '1214px',
                maxWidth: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }, children: [_jsx("div", { style: {
                        marginBottom: 32,
                        fontSize: '120px',
                        color: '#ffcc00'
                    }, children: "\uD83D\uDDFA\uFE0F" }), _jsx("h1", { style: {
                        fontSize: '2.5rem',
                        marginBottom: 16,
                        color: '#f5f5f7',
                        fontWeight: 'bold'
                    }, children: "Page introuvable" }), _jsx("div", { style: {
                        width: '100px',
                        height: '2px',
                        backgroundColor: '#333',
                        marginBottom: 24
                    } }), _jsx("p", { style: {
                        fontSize: '1.1rem',
                        marginBottom: 32,
                        color: '#ccc',
                        maxWidth: '500px',
                        lineHeight: 1.6
                    }, children: "La page que vous recherchez n'existe pas ou a \u00E9t\u00E9 d\u00E9plac\u00E9e." }), _jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 24,
                        borderRadius: 4,
                        marginBottom: 32,
                        maxWidth: '500px'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: 16 }, children: "Essayez ces solutions :" }), _jsxs("ul", { style: {
                                textAlign: 'left',
                                color: '#f5f5f7',
                                lineHeight: 1.8,
                                paddingLeft: 20
                            }, children: [_jsx("li", { children: "V\u00E9rifiez que l'URL est correcte" }), _jsx("li", { children: "Utilisez les liens de navigation de l'application" }), _jsx("li", { children: "Retournez \u00E0 votre dashboard" })] })] }), _jsxs("div", { style: {
                        display: 'flex',
                        gap: 16,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }, children: [user && (_jsx("button", { onClick: handleGoToDashboard, style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }, children: "\uD83C\uDFE0 Aller au Dashboard" })), _jsx("button", { onClick: handleGoHome, style: {
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }, children: "\uD83C\uDFE0 Page d'accueil" })] }), _jsxs("div", { style: {
                        marginTop: 48,
                        padding: 16,
                        backgroundColor: '#1a1a1a',
                        borderRadius: 4,
                        fontSize: '14px',
                        color: '#999',
                        maxWidth: '400px'
                    }, children: [_jsxs("p", { style: { margin: 0 }, children: [_jsx("strong", { children: "Erreur 404" }), " - Page non trouv\u00E9e"] }), _jsxs("p", { style: { margin: '8px 0 0 0' }, children: ["URL actuelle : ", window.location.pathname] })] })] }) }));
};
export default NotFoundPage;
