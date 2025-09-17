import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
export default function RegisterPage() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = React.useState('talent');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setSuccess(null);
        // Validation
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setBusy(false);
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            setBusy(false);
            return;
        }
        try {
            await signUp(email, password, role);
            setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
            setTimeout(() => {
                navigate(`/dashboard/${role}`, { replace: true });
            }, 2000);
        }
        catch (err) {
            console.error('Erreur auth:', err);
            if (err.message.includes('User already registered')) {
                setError('Un compte existe déjà avec cet email');
            }
            else {
                setError(err.message || 'Une erreur est survenue');
            }
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }, children: _jsxs("div", { style: {
                backgroundColor: '#1a1a1a',
                padding: '40px',
                borderRadius: '4px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '32px' }, children: [_jsx("h1", { style: {
                                color: '#ffcc00',
                                fontSize: '2rem',
                                fontWeight: '700',
                                marginBottom: '8px'
                            }, children: "ProdTalent" }), _jsx("p", { style: {
                                color: '#61bfac',
                                fontSize: '0.9rem',
                                margin: 0
                            }, children: "Un produit d'Edacy" })] }), _jsx("h2", { style: {
                        color: '#f5f5f7',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '24px',
                        textAlign: 'center'
                    }, children: "Cr\u00E9er votre compte" }), error && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        color: '#ff6b6b',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }, children: error })), success && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: 'rgba(97, 191, 172, 0.1)',
                        color: '#61bfac',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }, children: success })), _jsxs("form", { onSubmit: onSubmit, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "R\u00F4le *" }), _jsxs("select", { value: role, onChange: (e) => setRole(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }, children: [_jsx("option", { value: "talent", children: "Talent" }), _jsx("option", { value: "recruteur", children: "Recruteur" }), _jsx("option", { value: "coach", children: "Coach" })] })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "Email *" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    } })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "Mot de passe *" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    } })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "Confirmer le mot de passe *" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    } })] }), _jsx("button", { type: "submit", disabled: busy, style: {
                                width: '100%',
                                padding: '14px',
                                backgroundColor: busy ? '#666' : '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: busy ? 'not-allowed' : 'pointer',
                                marginBottom: '16px'
                            }, children: busy ? 'Création du compte...' : 'Créer mon compte' })] }), _jsx("div", { style: { textAlign: 'center' }, children: _jsx("button", { onClick: () => navigate('/'), style: {
                            background: 'none',
                            border: 'none',
                            color: '#ffcc00',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }, children: "\u2190 Retour \u00E0 l'accueil" }) })] }) }));
}
