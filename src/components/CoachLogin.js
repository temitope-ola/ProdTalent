import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const CoachLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            // Si on arrive ici, la connexion a réussi
            // Rediriger vers le dashboard coach
            navigate('/dashboard/coach', { replace: true });
        }
        catch (error) {
            console.error('Erreur de connexion:', error);
            setError('Erreur lors de la connexion');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }, children: _jsxs("div", { style: {
                backgroundColor: '#111',
                borderRadius: 12,
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '32px' }, children: [_jsx("h1", { style: {
                                color: '#ffcc00',
                                margin: '0 0 8px 0',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }, children: "Coach Login" }), _jsx("p", { style: {
                                color: '#f5f5f7',
                                margin: 0,
                                fontSize: '16px',
                                opacity: 0.8
                            }, children: "Acc\u00E9dez \u00E0 votre espace coach" })] }), _jsxs("form", { onSubmit: handleSubmit, style: { marginBottom: '24px' }, children: [_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }, children: "Email *" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: '1px solid #555',
                                        borderRadius: 8,
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }, placeholder: "votre@email.com" })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }, children: "Mot de passe *" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: '1px solid #555',
                                        borderRadius: 8,
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), error && (_jsx("div", { style: {
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                color: '#ff6b6b',
                                padding: '12px',
                                borderRadius: 8,
                                marginBottom: '20px',
                                fontSize: '14px',
                                textAlign: 'center'
                            }, children: error })), _jsx("button", { type: "submit", disabled: loading, style: {
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s ease'
                            }, onMouseEnter: (e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#e6b800';
                                }
                            }, onMouseLeave: (e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = '#ffcc00';
                                }
                            }, children: loading ? 'Connexion...' : 'Se connecter' })] }), _jsxs("div", { style: {
                        textAlign: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid #333'
                    }, children: [_jsx("p", { style: {
                                color: '#f5f5f7',
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                opacity: 0.8
                            }, children: "Pas encore de compte coach ?" }), _jsx("button", { onClick: () => navigate('/register/coach'), style: {
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: '1px solid #ffcc00',
                                borderRadius: 8,
                                padding: '10px 20px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#ffcc00';
                                e.currentTarget.style.color = '#000';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#ffcc00';
                            }, children: "Cr\u00E9er un compte coach" })] }), _jsx("div", { style: {
                        textAlign: 'center',
                        marginTop: '24px'
                    }, children: _jsx("button", { onClick: () => navigate('/'), style: {
                            backgroundColor: 'transparent',
                            color: '#888',
                            border: 'none',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }, children: "\u2190 Retour \u00E0 l'accueil" }) })] }) }));
};
export default CoachLogin;
