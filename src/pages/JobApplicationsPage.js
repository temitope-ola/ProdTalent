import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function JobApplicationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user || user.role !== 'recruteur') {
            navigate('/dashboard/recruteur');
            return;
        }
        if (jobId) {
            loadJobAndApplications();
        }
    }, [user, jobId, navigate]);
    const loadJobAndApplications = async () => {
        try {
            setIsLoading(true);
            // Charger l'annonce
            const jobData = await FirestoreService.getJobById(jobId);
            // Vérifier que l'annonce appartient au recruteur connecté
            if (jobData.recruiterId !== user?.id) {
                setError('Vous n\'êtes pas autorisé à voir les candidatures de cette annonce');
                return;
            }
            setJob(jobData);
            // Charger les candidatures
            const applicationsData = await FirestoreService.getJobApplications(jobId);
            // Enrichir avec les profils des talents
            const enrichedApplications = await Promise.all(applicationsData.map(async (app) => {
                try {
                    const talentProfile = await FirestoreService.getProfileById(app.talentId);
                    return {
                        ...app,
                        talentProfile
                    };
                }
                catch (error) {
                    console.error('Erreur lors du chargement du profil talent:', error);
                    return app;
                }
            }));
            setApplications(enrichedApplications);
        }
        catch (error) {
            console.error('Erreur lors du chargement:', error);
            setError('Erreur lors du chargement des candidatures');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await FirestoreService.updateApplicationStatus(applicationId, newStatus);
            setApplications(prev => prev.map(app => app.id === applicationId
                ? { ...app, status: newStatus }
                : app));
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            setError('Erreur lors de la mise à jour du statut');
        }
    };
    const handleViewTalentProfile = (talentId) => {
        navigate(`/profile/${talentId}`);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return '#61bfac';
            case 'rejected': return '#ff6b6b';
            case 'pending': return '#ffcc00';
            default: return '#888';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'accepted': return 'Acceptée';
            case 'rejected': return 'Refusée';
            case 'pending': return 'En attente';
            default: return status;
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
                                border: '1px solid #ffcc00',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: 16
                            }, children: "\u2190 Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: "Candidatures" })] }), error && (_jsx("div", { style: {
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid #ff6b6b',
                        color: '#ff6b6b',
                        padding: 16,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: error })), job && (_jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 20,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', marginTop: 0 }, children: job.title }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Entreprise:" }), " ", job.company] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Localisation:" }), " ", job.location] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0' }, children: [_jsx("strong", { children: "Candidatures:" }), " ", applications.length] })] })), applications.length === 0 ? (_jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 40,
                        borderRadius: 4,
                        textAlign: 'center'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0 }, children: "Aucune candidature" }), _jsx("p", { style: { color: '#f5f5f7' }, children: "Aucun talent n'a encore postul\u00E9 \u00E0 cette annonce." })] })) : (_jsx("div", { style: { display: 'grid', gap: 16 }, children: applications.map((application) => (_jsxs("div", { style: {
                            backgroundColor: '#111',
                            padding: 20,
                            borderRadius: 4,
                            border: '1px solid #333'
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: 8 }, children: application.talentName }), _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Email:" }), " ", application.talentEmail] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Date de candidature:" }), " ", formatDate(application.createdAt)] })] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: _jsx("span", { style: {
                                                padding: '4px 12px',
                                                backgroundColor: getStatusColor(application.status),
                                                color: '#000',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 'bold'
                                            }, children: getStatusText(application.status) }) })] }), application.talentProfile && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Comp\u00E9tences:" }), " ", application.talentProfile.skills || 'Non renseignées'] }), application.talentProfile.bio && (_jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Bio:" }), " ", application.talentProfile.bio] }))] })), application.coverLetter && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h4", { style: { color: '#ffcc00', marginBottom: 8 }, children: "Lettre de motivation" }), _jsx("div", { style: {
                                            backgroundColor: '#222',
                                            padding: 12,
                                            borderRadius: 4,
                                            color: '#f5f5f7',
                                            fontSize: 14,
                                            lineHeight: 1.5
                                        }, children: application.coverLetter })] })), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: () => handleViewTalentProfile(application.talentId), style: {
                                            padding: '8px 16px',
                                            backgroundColor: 'transparent',
                                            color: '#ffcc00',
                                            border: '1px solid #ffcc00',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 14
                                        }, children: "Voir le profil" }), application.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleStatusChange(application.id, 'accepted'), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: '#61bfac',
                                                    color: '#000',
                                                    border: '1px solid #61bfac',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 'bold'
                                                }, children: "Accepter" }), _jsx("button", { onClick: () => handleStatusChange(application.id, 'rejected'), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: '#ff6b6b',
                                                    color: '#fff',
                                                    border: '1px solid #ff6b6b',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 'bold'
                                                }, children: "Refuser" })] }))] })] }, application.id))) }))] }) }));
}
