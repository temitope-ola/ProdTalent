import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function EditJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { jobId } = useParams();
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
        contactInfo: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    useEffect(() => {
        if (!user || user.role !== 'recruteur') {
            navigate('/dashboard/recruteur');
            return;
        }
        if (jobId) {
            loadJob();
        }
    }, [user, jobId, navigate]);
    const loadJob = async () => {
        try {
            setIsLoading(true);
            const job = await FirestoreService.getJobById(jobId);
            // Vérifier que l'annonce appartient au recruteur connecté
            if (job.recruiterId !== user?.id) {
                setError('Vous n\'êtes pas autorisé à modifier cette annonce');
                return;
            }
            setFormData({
                title: job.title || '',
                company: job.company || '',
                location: job.location || '',
                type: job.type || 'full-time',
                remote: job.remote || false,
                salary: {
                    min: job.salary?.min || '',
                    max: job.salary?.max || '',
                    currency: job.salary?.currency || 'EUR'
                },
                description: job.description || '',
                requirements: job.requirements || '',
                benefits: job.benefits || '',
                contactInfo: job.contactInfo || ''
            });
        }
        catch (error) {
            console.error('Erreur lors du chargement de l\'annonce:', error);
            setError('Erreur lors du chargement de l\'annonce');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobId)
            return;
        try {
            setIsSaving(true);
            setError(null);
            // Validation basique
            if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
                setError('Veuillez remplir tous les champs obligatoires');
                return;
            }
            // Mettre à jour l'annonce
            await FirestoreService.updateJob(jobId, formData);
            setSuccess('Annonce mise à jour avec succès !');
            setTimeout(() => {
                navigate('/my-jobs');
            }, 2000);
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur lors de la mise à jour de l\'annonce');
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: _jsx("div", { style: { width: '1214px', maxWidth: '100%', padding: '24px' }, children: "Chargement..." }) }));
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7'
        }, children: _jsxs("div", { style: { width: '1214px', maxWidth: '100%', padding: '24px', margin: '0 auto' }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 32,
                        paddingBottom: 16,
                        borderBottom: '1px solid #333'
                    }, children: [_jsx("button", { onClick: () => navigate('/my-jobs'), style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: 16
                            }, children: "\u2190 Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: "Modifier l'annonce" })] }), error && (_jsx("div", { style: {
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: 'none',
                        color: '#ff6b6b',
                        padding: 16,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: error })), success && (_jsx("div", { style: {
                        backgroundColor: 'rgba(97, 191, 172, 0.1)',
                        border: 'none',
                        color: '#61bfac',
                        padding: 16,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: success })), _jsx("form", { onSubmit: handleSubmit, style: { maxWidth: 800 }, children: _jsxs("div", { style: { display: 'grid', gap: 24 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Titre du poste *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => handleInputChange('title', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                }, required: true })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Entreprise *" }), _jsx("input", { type: "text", value: formData.company, onChange: (e) => handleInputChange('company', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                }, required: true })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Localisation" }), _jsx("input", { type: "text", value: formData.location, onChange: (e) => handleInputChange('location', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Type de contrat" }), _jsxs("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                }, children: [_jsx("option", { value: "full-time", children: "Temps plein" }), _jsx("option", { value: "part-time", children: "Temps partiel" }), _jsx("option", { value: "contract", children: "Contrat" }), _jsx("option", { value: "internship", children: "Stage" })] })] })] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, color: '#ffcc00' }, children: [_jsx("input", { type: "checkbox", checked: formData.remote, onChange: (e) => handleInputChange('remote', e.target.checked), style: { margin: 0 } }), "T\u00E9l\u00E9travail possible"] }) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Salaire minimum" }), _jsx("input", { type: "number", value: formData.salary.min, onChange: (e) => handleInputChange('salary.min', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Salaire maximum" }), _jsx("input", { type: "number", value: formData.salary.max, onChange: (e) => handleInputChange('salary.max', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Devise" }), _jsxs("select", { value: formData.salary.currency, onChange: (e) => handleInputChange('salary.currency', e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: 14
                                                }, children: [_jsx("option", { value: "EUR", children: "EUR (\u20AC)" }), _jsx("option", { value: "USD", children: "USD ($)" }), _jsx("option", { value: "GBP", children: "GBP (\u00A3)" }), _jsx("option", { value: "XOF", children: "FCFA (XOF)" })] })] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Description du poste *" }), _jsx("textarea", { value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), rows: 6, style: {
                                            width: '100%',
                                            padding: 12,
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            resize: 'vertical'
                                        }, required: true })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Exigences et comp\u00E9tences" }), _jsx("textarea", { value: formData.requirements, onChange: (e) => handleInputChange('requirements', e.target.value), rows: 4, style: {
                                            width: '100%',
                                            padding: 12,
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            resize: 'vertical'
                                        } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Avantages et b\u00E9n\u00E9fices" }), _jsx("textarea", { value: formData.benefits, onChange: (e) => handleInputChange('benefits', e.target.value), rows: 4, style: {
                                            width: '100%',
                                            padding: 12,
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            resize: 'vertical'
                                        } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Informations de contact" }), _jsx("textarea", { value: formData.contactInfo, onChange: (e) => handleInputChange('contactInfo', e.target.value), rows: 3, placeholder: "Email, t\u00E9l\u00E9phone, ou autres informations de contact...", style: {
                                            width: '100%',
                                            padding: 12,
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 14,
                                            resize: 'vertical'
                                        } })] }), _jsxs("div", { style: { display: 'flex', gap: 16, justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", onClick: () => navigate('/my-jobs'), style: {
                                            padding: '12px 24px',
                                            backgroundColor: 'transparent',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 14
                                        }, children: "Annuler" }), _jsx("button", { type: "submit", disabled: isSaving, style: {
                                            padding: '12px 24px',
                                            backgroundColor: isSaving ? '#555' : '#ffcc00',
                                            color: isSaving ? '#888' : '#000',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: isSaving ? 'not-allowed' : 'pointer',
                                            fontSize: 14,
                                            fontWeight: 'bold'
                                        }, children: isSaving ? 'Mise à jour...' : 'Mettre à jour l\'annonce' })] })] }) })] }) }));
}
