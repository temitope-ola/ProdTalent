import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function ApplyJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [formData, setFormData] = useState({
        coverLetter: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    useEffect(() => {
        if (!user || user.role !== 'talent') {
            navigate('/dashboard/talent');
            return;
        }
        if (jobId) {
            loadJob();
        }
    }, [user, jobId, navigate]);
    const loadJob = async () => {
        try {
            setIsLoading(true);
            const jobData = await FirestoreService.getJobById(jobId);
            setJob(jobData);
        }
        catch (error) {
            console.error('Erreur lors du chargement de l\'annonce:', error);
            setError('Erreur lors du chargement de l\'annonce');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!jobId || !user)
            return;
        try {
            setIsSubmitting(true);
            setError(null);
            // Validation basique
            if (!formData.coverLetter.trim()) {
                setError('Veuillez rédiger une lettre de motivation');
                return;
            }
            // Vérifier si l'utilisateur a déjà postulé
            const existingApplications = await FirestoreService.getUserApplications(user.id);
            const alreadyApplied = existingApplications.some(app => app.jobId === jobId);
            if (alreadyApplied) {
                setError('Vous avez déjà postulé à cette annonce');
                return;
            }
            // Créer la candidature
            const applicationData = {
                talentId: user.id,
                talentName: user.displayName || user.email?.split('@')[0] || 'Talent',
                talentEmail: user.email,
                coverLetter: formData.coverLetter.trim()
            };
            await FirestoreService.applyToJob(jobId, user.id, applicationData);
            setSuccess('Candidature envoyée avec succès !');
            setTimeout(() => {
                navigate('/jobs');
            }, 2000);
        }
        catch (error) {
            console.error('Erreur lors de la candidature:', error);
            setError('Erreur lors de l\'envoi de la candidature');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const formatCurrency = (currency) => {
        switch (currency) {
            case 'EUR': return '€';
            case 'USD': return '$';
            case 'GBP': return '£';
            case 'XOF': return 'FCFA';
            default: return currency;
        }
    };
    const getTypeText = (type) => {
        switch (type) {
            case 'full-time': return 'Temps plein';
            case 'part-time': return 'Temps partiel';
            case 'contract': return 'Contrat';
            case 'internship': return 'Stage';
            default: return type;
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
    if (!job) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: _jsx("div", { style: { width: '1214px', maxWidth: '100%', padding: '24px' }, children: "Annonce non trouv\u00E9e" }) }));
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
                    }, children: [_jsx("button", { onClick: () => navigate('/jobs'), style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: 16
                            }, children: "\u2190 Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: "Postuler \u00E0 l'offre" })] }), error && (_jsx("div", { style: {
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
                    }, children: success })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }, children: [_jsxs("div", { children: [_jsx("h2", { style: { color: '#ffcc00', marginTop: 0 }, children: "D\u00E9tails de l'offre" }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        marginBottom: 24
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0 }, children: job.title }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Entreprise:" }), " ", job.company] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Localisation:" }), " ", job.location] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Type:" }), " ", getTypeText(job.type), " ", job.remote && '(Télétravail possible)'] }), job.salary?.min && job.salary?.max && (_jsxs("p", { style: { color: '#ffcc00', margin: '8px 0', fontWeight: 'bold' }, children: [_jsx("strong", { children: "Salaire:" }), " ", job.salary.min, " - ", job.salary.max, " ", formatCurrency(job.salary.currency)] }))] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        marginBottom: 24
                                    }, children: [_jsx("h4", { style: { color: '#ffcc00', marginTop: 0 }, children: "Description" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: 1.6 }, children: job.description })] }), job.requirements && (_jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        marginBottom: 24
                                    }, children: [_jsx("h4", { style: { color: '#ffcc00', marginTop: 0 }, children: "Exigences" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: 1.6 }, children: job.requirements })] })), job.benefits && (_jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4
                                    }, children: [_jsx("h4", { style: { color: '#ffcc00', marginTop: 0 }, children: "Avantages" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: 1.6 }, children: job.benefits })] }))] }), _jsxs("div", { children: [_jsx("h2", { style: { color: '#ffcc00', marginTop: 0 }, children: "Votre candidature" }), _jsxs("form", { onSubmit: handleSubmit, style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4
                                    }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Lettre de motivation *" }), _jsx("textarea", { value: formData.coverLetter, onChange: (e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value })), rows: 12, placeholder: "Pr\u00E9sentez-vous, expliquez pourquoi vous \u00EAtes int\u00E9ress\u00E9 par ce poste et pourquoi vous seriez un bon candidat...", style: {
                                                        width: '100%',
                                                        padding: 12,
                                                        backgroundColor: '#333',
                                                        color: '#f5f5f7',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        fontSize: 14,
                                                        resize: 'vertical',
                                                        lineHeight: 1.5
                                                    }, required: true }), _jsx("p", { style: { color: '#888', fontSize: 12, marginTop: 8 }, children: "Minimum 100 caract\u00E8res recommand\u00E9" })] }), _jsxs("div", { style: { display: 'flex', gap: 16, justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", onClick: () => navigate('/jobs'), style: {
                                                        padding: '12px 24px',
                                                        backgroundColor: 'transparent',
                                                        color: '#f5f5f7',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        fontSize: 14
                                                    }, children: "Annuler" }), _jsx("button", { type: "submit", disabled: isSubmitting, style: {
                                                        padding: '12px 24px',
                                                        backgroundColor: isSubmitting ? '#555' : '#ffcc00',
                                                        color: isSubmitting ? '#888' : '#000',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                        fontSize: 14,
                                                        fontWeight: 'bold'
                                                    }, children: isSubmitting ? 'Envoi...' : 'Envoyer ma candidature' })] })] }), _jsxs("div", { style: {
                                        backgroundColor: '#222',
                                        padding: 16,
                                        borderRadius: 4,
                                        marginTop: 16
                                    }, children: [_jsx("h4", { style: { color: '#ffcc00', marginTop: 0, marginBottom: 8 }, children: "Conseils" }), _jsxs("ul", { style: { color: '#f5f5f7', fontSize: 14, lineHeight: 1.5, margin: 0, paddingLeft: 20 }, children: [_jsx("li", { children: "Personnalisez votre lettre pour cette entreprise" }), _jsx("li", { children: "Mettez en avant vos comp\u00E9tences pertinentes" }), _jsx("li", { children: "Expliquez votre motivation pour ce poste" }), _jsx("li", { children: "Relisez votre texte avant l'envoi" })] })] })] })] })] }) }));
}
