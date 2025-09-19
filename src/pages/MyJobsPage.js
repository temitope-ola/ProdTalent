import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
export default function MyJobsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    useEffect(() => {
        const loadJobs = async () => {
            if (!user) {
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                const userJobs = await FirestoreService.getRecruiterJobs(user.id);
                setJobs(userJobs);
            }
            catch (error) {
                console.error('Erreur lors du chargement des annonces:', error);
                setError('Erreur lors du chargement des annonces');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadJobs();
    }, [user, navigate]);
    const handleToggleStatus = async (jobId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await FirestoreService.updateJobStatus(jobId, newStatus);
            setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            setError('Erreur lors de la mise à jour du statut');
        }
    };
    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
            return;
        }
        try {
            await FirestoreService.deleteJob(jobId);
            setJobs(prev => prev.filter(job => job.id !== jobId));
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setError('Erreur lors de la suppression de l\'annonce');
        }
    };
    const handleEditJob = (jobId) => {
        navigate(`/edit-job/${jobId}`);
    };
    const handleViewApplications = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#61bfac';
            case 'inactive': return '#ff6b6b';
            case 'draft': return '#ffcc00';
            default: return '#888';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'inactive': return 'Inactive';
            case 'draft': return 'Brouillon';
            default: return status;
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
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: "Chargement de vos annonces..." }));
    }
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
            }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        marginBottom: 24
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("button", { onClick: () => navigate('/dashboard/recruteur'), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }, children: "\u2190 Retour" }), _jsxs("h1", { style: { margin: 0, color: '#ffcc00' }, children: ["Mes Annonces (", jobs.length, ")"] })] }), _jsx("button", { onClick: () => navigate('/create-job'), style: {
                                padding: '10px 20px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }, children: "+ Nouvelle annonce" })] }), error && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        color: '#ff6b6b',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }, children: error })), jobs.length === 0 ? (_jsxs("div", { style: {
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: '#111',
                        borderRadius: '4px'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Aucune annonce publi\u00E9e" }), _jsx("p", { style: { color: '#888', marginBottom: '24px' }, children: "Commencez par cr\u00E9er votre premi\u00E8re annonce pour attirer les talents" }), _jsx("button", { onClick: () => navigate('/create-job'), style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }, children: "Cr\u00E9er ma premi\u00E8re annonce" })] })) : (_jsxs("div", { style: { display: 'flex', gap: '24px' }, children: [_jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: {
                                    backgroundColor: '#111',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }, children: [_jsx("div", { style: { padding: '20px', borderBottom: '1px solid #333' }, children: _jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Vos annonces" }) }), _jsx("div", { style: { maxHeight: '600px', overflow: 'auto' }, children: jobs.map(job => (_jsxs("div", { onClick: () => setSelectedJob(job), style: {
                                                padding: '20px',
                                                borderBottom: '1px solid #333',
                                                cursor: 'pointer',
                                                backgroundColor: selectedJob?.id === job.id ? '#222' : 'transparent',
                                                transition: 'background-color 0.2s ease'
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }, children: [_jsx("h3", { style: {
                                                                color: '#f5f5f7',
                                                                margin: '0 0 8px 0',
                                                                fontSize: '18px',
                                                                fontWeight: '600'
                                                            }, children: job.title }), _jsx("span", { style: {
                                                                color: getStatusColor(job.status),
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                padding: '4px 8px',
                                                                backgroundColor: `${getStatusColor(job.status)}20`,
                                                                borderRadius: '4px'
                                                            }, children: getStatusText(job.status) })] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0', fontSize: '14px' }, children: [job.company, " \u2022 ", job.location] }), _jsxs("div", { style: { display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }, children: [_jsxs("span", { children: ["\uD83D\uDCC5 ", formatDate(job.createdAt)] }), _jsxs("span", { children: ["\uD83D\uDC41\uFE0F ", job.views, " vues"] }), _jsxs("span", { children: ["\uD83D\uDCDD ", job.applications.length, " candidatures"] })] })] }, job.id))) })] }) }), selectedJob && (_jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: {
                                    backgroundColor: '#111',
                                    borderRadius: '4px',
                                    padding: '24px'
                                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: selectedJob.title }), _jsx("span", { style: {
                                                    color: getStatusColor(selectedJob.status),
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    padding: '4px 8px',
                                                    backgroundColor: `${getStatusColor(selectedJob.status)}20`,
                                                    borderRadius: '4px'
                                                }, children: getStatusText(selectedJob.status) })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Entreprise:" }), " ", selectedJob.company] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Localisation:" }), " ", selectedJob.location] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Type:" }), " ", selectedJob.type, " ", selectedJob.remote && '(Télétravail possible)'] }), selectedJob.salary.min && selectedJob.salary.max && (_jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Salaire:" }), " ", selectedJob.salary.min, " - ", selectedJob.salary.max, " ", formatCurrency(selectedJob.salary.currency)] })), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Publi\u00E9e le:" }), " ", formatDate(selectedJob.createdAt)] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Vues:" }), " ", selectedJob.views] }), _jsxs("p", { style: { color: '#888', margin: 0 }, children: [_jsx("strong", { children: "Candidatures:" }), " ", selectedJob.applications.length] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 12px 0' }, children: "Description" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: '1.6', margin: 0 }, children: selectedJob.description })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' }, children: [_jsxs("button", { onClick: () => handleViewApplications(selectedJob.id), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: '#61bfac',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }, children: ["\uD83D\uDCDD Voir candidatures (", selectedJob.applications.length, ")"] }), _jsx("button", { onClick: () => handleToggleStatus(selectedJob.id, selectedJob.status), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: selectedJob.status === 'active' ? '#ff6b6b' : '#61bfac',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }, children: selectedJob.status === 'active' ? '⏸️ Désactiver' : '▶️ Activer' }), _jsx("button", { onClick: () => handleEditJob(selectedJob.id), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: 'transparent',
                                                    color: '#ffcc00',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }, children: "\u270F\uFE0F Modifier" }), _jsx("button", { onClick: () => handleDeleteJob(selectedJob.id), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: 'transparent',
                                                    color: '#ff6b6b',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }, children: "\uD83D\uDDD1\uFE0F Supprimer" })] })] }) }))] }))] }) }));
}
