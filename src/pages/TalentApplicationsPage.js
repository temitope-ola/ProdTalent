import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function TalentApplicationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    useEffect(() => {
        if (!user || user.role !== 'talent') {
            navigate('/dashboard/talent');
            return;
        }
        loadApplications();
    }, [user, navigate]);
    const loadApplications = async () => {
        try {
            setIsLoading(true);
            // Charger toutes les candidatures du talent
            const userApplications = await FirestoreService.getUserApplications(user.id);
            // Enrichir avec les détails des annonces
            const enrichedApplications = await Promise.all(userApplications.map(async (app) => {
                try {
                    const job = await FirestoreService.getJobById(app.jobId);
                    return {
                        ...app,
                        jobTitle: job.title,
                        company: job.company,
                        job
                    };
                }
                catch (error) {
                    console.error('Erreur lors du chargement de l\'annonce:', error);
                    return {
                        ...app,
                        jobTitle: 'Annonce supprimée',
                        company: 'Entreprise inconnue'
                    };
                }
            }));
            // Trier par date de candidature (plus récentes en premier)
            enrichedApplications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setApplications(enrichedApplications);
        }
        catch (error) {
            console.error('Erreur lors du chargement des candidatures:', error);
            setError('Erreur lors du chargement des candidatures');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleViewJob = (jobId) => {
        navigate(`/jobs`);
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
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'all')
            return true;
        return app.status === filterStatus;
    });
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
                    }, children: [_jsx("button", { onClick: () => navigate('/dashboard/talent'), style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: '1px solid #ffcc00',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginRight: 16
                            }, children: "\u2190 Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: "Mes candidatures" })] }), error && (_jsx("div", { style: {
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid #ff6b6b',
                        color: '#ff6b6b',
                        padding: 16,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: error })), _jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 20,
                        borderRadius: 4,
                        marginBottom: 24
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0 }, children: "Vue d'ensemble" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }, children: [_jsx("div", { children: _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Total:" }), " ", applications.length] }) }), _jsx("div", { children: _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "En attente:" }), " ", applications.filter(app => app.status === 'pending').length] }) }), _jsx("div", { children: _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Accept\u00E9es:" }), " ", applications.filter(app => app.status === 'accepted').length] }) }), _jsx("div", { children: _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Refus\u00E9es:" }), " ", applications.filter(app => app.status === 'rejected').length] }) })] })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { display: 'block', marginBottom: 8, color: '#ffcc00' }, children: "Filtrer par statut:" }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), style: {
                                padding: '8px 12px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: '1px solid #555',
                                borderRadius: 4,
                                fontSize: 14
                            }, children: [_jsx("option", { value: "all", children: "Toutes mes candidatures" }), _jsx("option", { value: "pending", children: "En attente" }), _jsx("option", { value: "accepted", children: "Accept\u00E9es" }), _jsx("option", { value: "rejected", children: "Refus\u00E9es" })] })] }), filteredApplications.length === 0 ? (_jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 40,
                        borderRadius: 4,
                        textAlign: 'center'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0 }, children: filterStatus === 'all' ? 'Aucune candidature' : `Aucune candidature ${getStatusText(filterStatus).toLowerCase()}` }), _jsx("p", { style: { color: '#f5f5f7' }, children: filterStatus === 'all'
                                ? 'Vous n\'avez pas encore postulé à des offres d\'emploi.'
                                : `Aucune candidature ${getStatusText(filterStatus).toLowerCase()} trouvée.` }), _jsx("button", { onClick: () => navigate('/jobs'), style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: '1px solid #ffcc00',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold',
                                marginTop: 16
                            }, children: "Voir les offres d'emploi" })] })) : (_jsx("div", { style: { display: 'grid', gap: 16 }, children: filteredApplications.map((application) => (_jsxs("div", { style: {
                            backgroundColor: '#111',
                            padding: 20,
                            borderRadius: 4,
                            border: '1px solid #333'
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: 8 }, children: application.jobTitle }), _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Entreprise:" }), " ", application.company] }), _jsxs("p", { style: { color: '#f5f5f7', margin: '4px 0' }, children: [_jsx("strong", { children: "Date de candidature:" }), " ", formatDate(application.createdAt)] })] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: _jsx("span", { style: {
                                                padding: '4px 12px',
                                                backgroundColor: getStatusColor(application.status),
                                                color: '#000',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 'bold'
                                            }, children: getStatusText(application.status) }) })] }), application.status === 'accepted' && (_jsxs("div", { style: {
                                    backgroundColor: 'rgba(97, 191, 172, 0.1)',
                                    border: '1px solid #61bfac',
                                    color: '#61bfac',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginBottom: 16
                                }, children: [_jsx("strong", { children: "\uD83C\uDF89 F\u00E9licitations !" }), " Votre candidature a \u00E9t\u00E9 accept\u00E9e. L'entreprise devrait vous contacter prochainement."] })), application.status === 'rejected' && (_jsxs("div", { style: {
                                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                    border: '1px solid #ff6b6b',
                                    color: '#ff6b6b',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginBottom: 16
                                }, children: [_jsx("strong", { children: "\uD83D\uDCDD Votre candidature n'a pas \u00E9t\u00E9 retenue" }), " pour ce poste. Ne vous d\u00E9couragez pas, continuez \u00E0 postuler \u00E0 d'autres offres !"] })), application.coverLetter && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h4", { style: { color: '#ffcc00', marginBottom: 8 }, children: "Votre lettre de motivation" }), _jsx("div", { style: {
                                            backgroundColor: '#222',
                                            padding: 12,
                                            borderRadius: 4,
                                            color: '#f5f5f7',
                                            fontSize: 14,
                                            lineHeight: 1.5,
                                            maxHeight: 100,
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }, children: application.coverLetter.length > 200
                                            ? `${application.coverLetter.substring(0, 200)}...`
                                            : application.coverLetter })] })), _jsx("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: _jsx("button", { onClick: () => handleViewJob(application.jobId), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#61bfac',
                                        border: '1px solid #61bfac',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: 14
                                    }, children: "Voir l'annonce" }) })] }, application.id))) }))] }) }));
}
