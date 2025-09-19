import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
export default function JobsListPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterRemote, setFilterRemote] = useState(false);
    useEffect(() => {
        const loadJobs = async () => {
            try {
                setIsLoading(true);
                const activeJobs = await FirestoreService.getAllActiveJobs();
                setJobs(activeJobs);
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
    }, []);
    const handleJobClick = async (job) => {
        setSelectedJob(job);
        // Incrémenter les vues
        await FirestoreService.incrementJobViews(job.id);
    };
    const handleApply = (jobId) => {
        if (!user) {
            navigate('/');
            return;
        }
        if (user.role !== 'talent') {
            showNotification({
                type: 'error',
                title: 'Accès refusé',
                message: 'Seuls les talents peuvent postuler aux offres d\'emploi'
            });
            return;
        }
        navigate(`/jobs/${jobId}/apply`);
    };
    const handleContactRecruiter = (job) => {
        navigate(`/profile/${job.recruiterId}`);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
    const formatCurrency = (currency) => {
        switch (currency) {
            case 'EUR': return '€';
            case 'USD': return '$';
            case 'GBP': return '£';
            case 'XOF': return 'FCFA';
            default: return currency;
        }
    };
    // Filtrer les annonces
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || job.type === filterType;
        const matchesRemote = !filterRemote || job.remote;
        return matchesSearch && matchesType && matchesRemote;
    });
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: "Chargement des annonces..." }));
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
            }, children: [_jsx("header", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        marginBottom: 24
                    }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("button", { onClick: () => navigate('/dashboard/talent'), style: {
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    color: '#ffcc00',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "\u2190 Retour" }), _jsxs("h1", { style: { margin: 0, color: '#ffcc00' }, children: ["Offres d'emploi (", filteredJobs.length, ")"] })] }) }), error && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        color: '#ff6b6b',
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }, children: error })), _jsx("div", { style: {
                        backgroundColor: '#111',
                        borderRadius: '4px',
                        padding: '20px',
                        marginBottom: '24px'
                    }, children: _jsxs("div", { style: { display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("div", { style: { flex: 1, minWidth: '200px' }, children: _jsx("input", { type: "text", placeholder: "Rechercher par titre, entreprise, localisation...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    } }) }), _jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), style: {
                                    padding: '10px 12px',
                                    backgroundColor: '#333',
                                    color: '#f5f5f7',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }, children: [_jsx("option", { value: "all", children: "Tous les types" }), _jsx("option", { value: "full-time", children: "Temps plein" }), _jsx("option", { value: "part-time", children: "Temps partiel" }), _jsx("option", { value: "contract", children: "Contrat" }), _jsx("option", { value: "internship", children: "Stage" })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: filterRemote, onChange: (e) => setFilterRemote(e.target.checked), style: { marginRight: '8px' } }), _jsx("span", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "T\u00E9l\u00E9travail uniquement" })] })] }) }), filteredJobs.length === 0 ? (_jsxs("div", { style: {
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: '#111',
                        borderRadius: '4px'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: "Aucune annonce trouv\u00E9e" }), _jsx("p", { style: { color: '#888' }, children: searchTerm || filterType !== 'all' || filterRemote
                                ? 'Essayez de modifier vos critères de recherche'
                                : 'Aucune offre d\'emploi disponible pour le moment' })] })) : (_jsxs("div", { style: { display: 'flex', gap: '24px' }, children: [_jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: {
                                    backgroundColor: '#111',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }, children: [_jsx("div", { style: { padding: '20px', borderBottom: '1px solid #333' }, children: _jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Annonces disponibles" }) }), _jsx("div", { style: { maxHeight: '600px', overflow: 'auto' }, children: filteredJobs.map(job => (_jsxs("div", { onClick: () => handleJobClick(job), style: {
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
                                                                color: '#61bfac',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                padding: '4px 8px',
                                                                backgroundColor: 'rgba(97, 191, 172, 0.2)',
                                                                borderRadius: '4px'
                                                            }, children: getTypeText(job.type) })] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0', fontSize: '14px' }, children: [job.company, " \u2022 ", job.location, " ", job.remote && '• 🌐 Télétravail'] }), job.salary.min && job.salary.max && (_jsxs("p", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }, children: ["\uD83D\uDCB0 ", job.salary.min, " - ", job.salary.max, " ", formatCurrency(job.salary.currency)] })), _jsxs("div", { style: { display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }, children: [_jsxs("span", { children: ["\uD83D\uDCC5 ", formatDate(job.createdAt)] }), _jsxs("span", { children: ["\uD83D\uDC41\uFE0F ", job.views, " vues"] })] })] }, job.id))) })] }) }), selectedJob && (_jsx("div", { style: { flex: 1 }, children: _jsxs("div", { style: {
                                    backgroundColor: '#111',
                                    borderRadius: '4px',
                                    padding: '24px'
                                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: selectedJob.title }), _jsx("span", { style: {
                                                    color: '#61bfac',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    padding: '4px 8px',
                                                    backgroundColor: 'rgba(97, 191, 172, 0.2)',
                                                    borderRadius: '4px'
                                                }, children: getTypeText(selectedJob.type) })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Entreprise:" }), " ", selectedJob.company] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Localisation:" }), " ", selectedJob.location] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Type:" }), " ", getTypeText(selectedJob.type), " ", selectedJob.remote && '(Télétravail possible)'] }), selectedJob.salary.min && selectedJob.salary.max && (_jsxs("p", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontWeight: '500' }, children: [_jsx("strong", { children: "Salaire:" }), " ", selectedJob.salary.min, " - ", selectedJob.salary.max, " ", formatCurrency(selectedJob.salary.currency)] })), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "Publi\u00E9e le:" }), " ", formatDate(selectedJob.createdAt)] }), _jsxs("p", { style: { color: '#888', margin: 0 }, children: [_jsx("strong", { children: "Vues:" }), " ", selectedJob.views] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 12px 0' }, children: "Description" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: '1.6', margin: '0 0 16px 0' }, children: selectedJob.description })] }), selectedJob.requirements && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 12px 0' }, children: "Pr\u00E9requis" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: '1.6', margin: 0 }, children: selectedJob.requirements })] })), selectedJob.benefits && (_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 12px 0' }, children: "Avantages" }), _jsx("p", { style: { color: '#f5f5f7', lineHeight: '1.6', margin: 0 }, children: selectedJob.benefits })] })), _jsxs("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => handleApply(selectedJob.id), style: {
                                                    padding: '12px 24px',
                                                    backgroundColor: '#ffcc00',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '14px'
                                                }, children: "\uD83D\uDCDD Postuler" }), _jsx("button", { onClick: () => handleContactRecruiter(selectedJob), style: {
                                                    padding: '12px 24px',
                                                    backgroundColor: 'transparent',
                                                    color: '#61bfac',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }, children: "\uD83D\uDCAC Contacter le recruteur" })] })] }) }))] }))] }) }));
}
