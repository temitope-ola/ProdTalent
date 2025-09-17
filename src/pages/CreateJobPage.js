import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function CreateJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        remote: false,
        salary: {
            min: '',
            max: '',
            currency: 'EUR'
        },
        description: '',
        requirements: '',
        benefits: '',
        contactEmail: user?.email || '',
        contactPhone: ''
    });
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleSalaryChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            salary: {
                ...prev.salary,
                [field]: value
            }
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            if (!user) {
                throw new Error('Utilisateur non connecté');
            }
            // Validation basique
            if (!formData.title || !formData.company || !formData.description) {
                throw new Error('Veuillez remplir tous les champs obligatoires');
            }
            const jobData = {
                ...formData,
                recruiterId: user.id,
                recruiterName: user.displayName || user.email?.split('@')[0] || 'Recruteur',
                recruiterEmail: user.email,
                status: 'active',
                createdAt: new Date(),
                applications: [],
                views: 0
            };
            await FirestoreService.createJob(jobData);
            setSuccess('Annonce créée avec succès !');
            setTimeout(() => {
                navigate('/my-jobs');
            }, 2000);
        }
        catch (err) {
            console.error('Erreur lors de la création de l\'annonce:', err);
            setError(err.message || 'Une erreur est survenue');
        }
        finally {
            setIsLoading(false);
        }
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
                padding: '24px'
            }, children: [_jsx("header", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        marginBottom: 24
                    }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("button", { onClick: () => navigate('/dashboard/recruteur'), style: {
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    color: '#ffcc00',
                                    border: '1px solid #ffcc00',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "\u2190 Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: "Cr\u00E9er une annonce" })] }) }), _jsxs("div", { style: {
                        maxWidth: '800px',
                        margin: '0 auto',
                        backgroundColor: '#111',
                        borderRadius: '4px',
                        padding: '32px'
                    }, children: [error && (_jsx("div", { style: {
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
                            }, children: success })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Informations de base" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Titre du poste *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => handleInputChange('title', e.target.value), required: true, style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "Ex: D\u00E9veloppeur Full Stack React" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Entreprise *" }), _jsx("input", { type: "text", value: formData.company, onChange: (e) => handleInputChange('company', e.target.value), required: true, style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "Nom de votre entreprise" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Localisation" }), _jsx("input", { type: "text", value: formData.location, onChange: (e) => handleInputChange('location', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "Paris, France" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Type de contrat" }), _jsxs("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, children: [_jsx("option", { value: "full-time", children: "Temps plein" }), _jsx("option", { value: "part-time", children: "Temps partiel" }), _jsx("option", { value: "contract", children: "Contrat" }), _jsx("option", { value: "internship", children: "Stage" })] })] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', marginTop: '24px' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: formData.remote, onChange: (e) => handleInputChange('remote', e.target.checked), style: { marginRight: '8px' } }), _jsx("span", { style: { color: '#f5f5f7' }, children: "T\u00E9l\u00E9travail possible" })] }) })] })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "R\u00E9mun\u00E9ration" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Salaire minimum" }), _jsx("input", { type: "number", value: formData.salary.min, onChange: (e) => handleSalaryChange('min', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "35000" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Salaire maximum" }), _jsx("input", { type: "number", value: formData.salary.max, onChange: (e) => handleSalaryChange('max', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "55000" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Devise" }), _jsxs("select", { value: formData.salary.currency, onChange: (e) => handleSalaryChange('currency', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, children: [_jsx("option", { value: "EUR", children: "EUR (\u20AC)" }), _jsx("option", { value: "USD", children: "USD ($)" }), _jsx("option", { value: "GBP", children: "GBP (\u00A3)" }), _jsx("option", { value: "XOF", children: "FCFA (XOF)" })] })] })] })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Description du poste *" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), required: true, rows: 6, style: {
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }, placeholder: "D\u00E9crivez le poste, les missions principales, l'environnement de travail..." })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Pr\u00E9requis et comp\u00E9tences" }), _jsx("textarea", { value: formData.requirements, onChange: (e) => handleInputChange('requirements', e.target.value), rows: 4, style: {
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }, placeholder: "Comp\u00E9tences techniques requises, exp\u00E9rience, formation..." })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Avantages et b\u00E9n\u00E9fices" }), _jsx("textarea", { value: formData.benefits, onChange: (e) => handleInputChange('benefits', e.target.value), rows: 4, style: {
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }, placeholder: "Avantages sociaux, environnement de travail, opportunit\u00E9s..." })] }), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Informations de contact" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Email de contact *" }), _jsx("input", { type: "email", value: formData.contactEmail, onChange: (e) => handleInputChange('contactEmail', e.target.value), required: true, style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "contact@entreprise.com" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "T\u00E9l\u00E9phone (optionnel)" }), _jsx("input", { type: "tel", value: formData.contactPhone, onChange: (e) => handleInputChange('contactPhone', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '12px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: '1px solid #555',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }, placeholder: "+33 1 23 45 67 89" })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: '16px', justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", onClick: () => navigate('/dashboard/recruteur'), style: {
                                                padding: '12px 24px',
                                                backgroundColor: 'transparent',
                                                color: '#f5f5f7',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }, children: "Annuler" }), _jsx("button", { type: "submit", disabled: isLoading, style: {
                                                padding: '12px 24px',
                                                backgroundColor: isLoading ? '#666' : '#ffcc00',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }, children: isLoading ? 'Création...' : 'Publier l\'annonce' })] })] })] })] }) }));
}
