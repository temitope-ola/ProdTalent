import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import TalentAgendaView from '../components/TalentAgendaView';
import TalentAppointmentManager from '../components/TalentAppointmentManager';
import { useNotifications } from '../components/NotificationManager';
export default function TalentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        skills: '',
        location: '',
        contractType: '',
        company: ''
    });
    // Statistiques
    const [stats, setStats] = useState({
        applicationsCount: 0,
        messagesCount: 0,
        recommendationsCount: 0,
        appointmentsCount: 0
    });
    // Redirection si l'utilisateur n'est pas un talent
    useEffect(() => {
        if (user && user.role !== 'talent') {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    // Charger le profil et les statistiques
    useEffect(() => {
        if (user) {
            loadProfile();
            loadStats();
            loadJobs();
        }
    }, [user]);
    // Filtrer les jobs quand les filtres changent
    useEffect(() => {
        applyFilters();
    }, [jobs, activeFilters]);
    // Fermer le menu profil quand on clique à l'extérieur (copié du RecruiterDashboard)
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('[data-profile-menu]')) {
                setShowProfileMenu(false);
            }
        };
        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);
    const loadProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            let userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
            // Si le profil n'existe pas, le créer
            if (!userProfile) {
                const created = await FirestoreService.createProfile(user.id, user.email, user.role);
                if (created) {
                    userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
                }
            }
            setProfile(userProfile);
        }
        catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadStats = async () => {
        if (!user)
            return;
        try {
            // Charger les candidatures depuis Firestore
            const applications = await FirestoreService.getUserApplications(user.id);
            // Charger les messages
            const userMessages = await FirestoreService.getUserMessages(user.id);
            // Charger les recommandations
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const recommendationsRef = collection(db, 'recommendations');
            const recommendationsQuery = query(recommendationsRef, where('talentId', '==', user.id));
            const recommendationsSnapshot = await getDocs(recommendationsQuery);
            // Charger les rendez-vous
            const { AppointmentService } = await import('../services/appointmentService');
            const appointmentsResult = await AppointmentService.getTalentAppointments(user.id);
            const appointmentsData = appointmentsResult.success ? appointmentsResult.data || [] : [];
            setStats({
                applicationsCount: applications.length,
                messagesCount: userMessages.length,
                recommendationsCount: recommendationsSnapshot.size,
                appointmentsCount: appointmentsData.length
            });
        }
        catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            // En cas d'erreur, on garde les valeurs par défaut (0)
            setStats({
                applicationsCount: 0,
                messagesCount: 0,
                recommendationsCount: 0,
                appointmentsCount: 0
            });
        }
    };
    const loadJobs = async () => {
        if (!user)
            return;
        try {
            // Charger toutes les offres d'emploi disponibles
            const allJobs = await FirestoreService.getAllJobs();
            setJobs(allJobs);
        }
        catch (error) {
            console.error('Erreur lors du chargement des offres:', error);
            setJobs([]);
        }
    };
    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        let filtered = jobs;
        // Filtre par compétences
        if (activeFilters.skills) {
            filtered = filtered.filter(job => {
                if (!job.skills)
                    return false;
                const jobSkills = Array.isArray(job.skills)
                    ? job.skills.map((skill) => skill.toLowerCase())
                    : job.skills.toLowerCase().split(/[,\s]+/).filter((skill) => skill.trim());
                return jobSkills.some((skill) => skill.includes(activeFilters.skills.toLowerCase()) ||
                    activeFilters.skills.toLowerCase().includes(skill));
            });
        }
        // Filtre par localisation
        if (activeFilters.location) {
            filtered = filtered.filter(job => job.location && job.location.toLowerCase().includes(activeFilters.location.toLowerCase()));
        }
        // Filtre par type de contrat
        if (activeFilters.contractType) {
            filtered = filtered.filter(job => job.contractType === activeFilters.contractType);
        }
        // Filtre par entreprise
        if (activeFilters.company) {
            filtered = filtered.filter(job => job.company && job.company.toLowerCase().includes(activeFilters.company.toLowerCase()));
        }
        setFilteredJobs(filtered);
    };
    // Fonctions pour gérer les filtres
    const handleFilterChange = (filterType, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    const clearFilter = (filterType) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: ''
        }));
    };
    // Fonction pour calculer le temps écoulé
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'À l\'instant';
        if (diffInHours < 24)
            return `Il y a ${diffInHours}h`;
        if (diffInHours < 48)
            return 'Hier';
        return `Il y a ${Math.floor(diffInHours / 24)}j`;
    };
    // Affichage de chargement
    if (loading) {
        return (_jsx("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#f5f5f7'
            }, children: "Chargement..." }));
    }
    // Redirection si pas connecté
    if (!user) {
        navigate('/', { replace: true });
        return null;
    }
    const handleLogout = async () => {
        try {
            console.log('🔍 Test: Tentative de déconnexion...');
            console.log('🔍 Test: User actuel:', user);
            console.log('🔍 Test: Fonction logout disponible:', typeof logout);
            await logout();
            console.log('✅ Test: Déconnexion réussie, redirection...');
            navigate('/', { replace: true });
        }
        catch (error) {
            console.error('❌ Test: Erreur lors de la déconnexion:', error);
            // Afficher une notification d'erreur à l'utilisateur
            showNotification({
                type: 'error',
                title: 'Erreur de déconnexion',
                message: 'Impossible de se déconnecter. Veuillez réessayer.'
            });
        }
    };
    const handleEditProfile = () => {
        console.log('🔍 Test: handleEditProfile appelée');
        console.log('🔍 Test: isEditModalOpen avant:', isEditModalOpen);
        setIsEditModalOpen(true);
        console.log('🔍 Test: isEditModalOpen après setState');
    };
    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };
    const handleProfileAction = (action) => {
        console.log('🔍 handleProfileAction called with:', action);
        setShowProfileMenu(false);
        switch (action) {
            case 'profile':
                console.log('🔍 Navigating to profile page');
                navigate('/profile');
                break;
            case 'edit':
                console.log('🔍 Opening edit modal');
                setIsEditModalOpen(true);
                break;
            case 'logout':
                console.log('🔍 Handling logout');
                handleLogout();
                break;
            default:
                console.log('🔍 Unknown action:', action);
        }
    };
    const handleViewProfile = () => {
        console.log('🔍 Test: handleViewProfile appelée');
        console.log('🔍 Test: Navigation vers /profile');
        navigate('/profile');
    };
    const handleSaveProfile = async (updatedProfile) => {
        console.log('Profil mis à jour:', updatedProfile);
        setProfile(updatedProfile);
        // Recharger le profil depuis Firestore pour s'assurer que tout est à jour
        await loadProfile();
    };
    const handleViewJobs = () => {
        navigate('/jobs');
    };
    const handleViewApplications = () => {
        navigate('/my-applications');
    };
    const handleViewMessages = () => {
        navigate('/talent/messages');
    };
    const handleOpenMessages = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'Les messages seront bientôt disponibles'
        });
        // Ici vous pourriez ouvrir un chat ou naviguer vers une page de messages
    };
    const handleConnectToRecruiters = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'La connexion aux recruteurs sera bientôt disponible'
        });
        // Ici vous pourriez naviguer vers une page de recherche de recruteurs
    };
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, children: [_jsxs("div", { style: {
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '20px'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            padding: '12px 16px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '4px'
                        }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "Dashboard Talent" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '12px' }, children: "G\u00E9rez votre carri\u00E8re et vos opportunit\u00E9s" })] }), _jsxs("div", { style: { position: 'relative' }, "data-profile-menu": true, children: [_jsxs("div", { onClick: handleProfileClick, style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 10px',
                                            backgroundColor: '#333',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsx(Avatar, { src: profile?.avatarUrl, alt: user?.email ? user.email.split('@')[0] : 'Utilisateur', size: "small" }), _jsx("span", { style: { fontSize: '13px', color: '#f5f5f7' }, children: user?.email ? user.email.split('@')[0] : 'Utilisateur' }), _jsx("span", { style: {
                                                    fontSize: '10px',
                                                    color: '#888',
                                                    transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s'
                                                }, children: "\u25BC" })] }), showProfileMenu && (_jsxs("div", { "data-profile-menu": true, style: {
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '5px',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '4px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                            border: '1px solid #333',
                                            minWidth: '180px',
                                            zIndex: 1000
                                        }, children: [_jsxs("div", { onClick: (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleProfileAction('profile');
                                                }, style: {
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #333',
                                                    transition: 'background-color 0.2s'
                                                }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#333', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#1a1a1a', children: [_jsx("div", { style: { fontSize: '13px', color: '#f5f5f7' }, children: "\uD83D\uDC64 Mon profil" }), _jsx("div", { style: { fontSize: '11px', color: '#888', marginTop: '2px' }, children: user?.email })] }), _jsx("div", { onClick: (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleProfileAction('logout');
                                                }, style: {
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#333', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#1a1a1a', children: _jsx("div", { style: { fontSize: '13px', color: '#f5f5f7' }, children: "\uD83D\uDEAA Se d\u00E9connecter" }) })] }))] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }, children: [_jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    border: 'none'
                                }, onClick: handleViewApplications, children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Candidatures (", stats.applicationsCount, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Consultez et g\u00E9rez vos candidatures" })] }), _jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }, onClick: () => setIsCalendarOpen(true), children: [_jsx("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: "Agenda de Coaching" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Consultez l'agenda et r\u00E9servez votre cr\u00E9neau" })] }), _jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }, onClick: () => setIsAppointmentsOpen(true), children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Mes Rendez-vous (", stats.appointmentsCount, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Consultez vos rendez-vous et leur statut" })] }), _jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }, onClick: () => navigate('/talent/recommendations'), children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Recommandations (", stats.recommendationsCount, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Recommandations envoy\u00E9es par vos coaches" })] }), _jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }, onClick: handleViewMessages, children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Messages (", stats.messagesCount, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Communiquez avec les recruteurs et coaches" })] })] }), _jsxs("div", { style: {
                            backgroundColor: '#1a1a1a',
                            borderRadius: '4px',
                            padding: '20px',
                            paddingLeft: '0px'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px',
                                    paddingLeft: '20px'
                                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("div", { onClick: () => setShowFilters(!showFilters), style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    paddingLeft: '16px',
                                                    backgroundColor: '#333',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsxs("div", { style: {
                                                            width: '16px',
                                                            height: '16px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between'
                                                        }, children: [_jsx("div", { style: { width: '100%', height: '2px', backgroundColor: '#ffcc00' } }), _jsx("div", { style: { width: '75%', height: '2px', backgroundColor: '#ffcc00' } }), _jsx("div", { style: { width: '50%', height: '2px', backgroundColor: '#ffcc00' } })] }), _jsx("span", { style: { fontSize: '14px', color: '#ffcc00' }, children: showFilters ? 'Fermer' : 'Filtrer' })] }), _jsx("div", { style: {
                                                    marginLeft: showFilters ? '250px' : '0px',
                                                    transition: 'margin-left 0.3s ease'
                                                }, children: _jsxs("h2", { style: { margin: 0, color: '#ffcc00' }, children: ["Opportunit\u00E9s r\u00E9centes (", filteredJobs.length, ")"] }) })] }), _jsx("span", { style: { fontSize: '14px', color: '#888' }, children: "Page 1" })] }), _jsxs("div", { style: { display: 'flex', gap: '20px' }, children: [_jsx("div", { style: {
                                            width: showFilters ? '250px' : '0px',
                                            overflow: 'hidden',
                                            transition: 'width 0.3s ease',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '4px',
                                            padding: showFilters ? '25px' : '0px',
                                            height: 'fit-content'
                                        }, children: showFilters && (_jsx(_Fragment, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: '8px'
                                                                }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Comp\u00E9tences" }), activeFilters.skills && (_jsx("button", { onClick: () => clearFilter('skills'), style: {
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#ff6b6b',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px'
                                                                        }, children: "Effacer" }))] }), _jsx("input", { type: "text", placeholder: "ex: React, Python...", value: activeFilters.skills, onChange: (e) => handleFilterChange('skills', e.target.value), style: {
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    backgroundColor: '#333',
                                                                    color: '#f5f5f7',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px'
                                                                } })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: '8px'
                                                                }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Localisation" }), activeFilters.location && (_jsx("button", { onClick: () => clearFilter('location'), style: {
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#ff6b6b',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px'
                                                                        }, children: "Effacer" }))] }), _jsx("input", { type: "text", placeholder: "ex: Paris, Remote...", value: activeFilters.location, onChange: (e) => handleFilterChange('location', e.target.value), style: {
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    backgroundColor: '#333',
                                                                    color: '#f5f5f7',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px'
                                                                } })] }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: '8px'
                                                                }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Type de contrat" }), activeFilters.contractType && (_jsx("button", { onClick: () => clearFilter('contractType'), style: {
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#ff6b6b',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px'
                                                                        }, children: "Effacer" }))] }), _jsxs("select", { value: activeFilters.contractType, onChange: (e) => handleFilterChange('contractType', e.target.value), style: {
                                                                    width: '100%',
                                                                    padding: '8px',
                                                                    backgroundColor: '#333',
                                                                    color: '#f5f5f7',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px'
                                                                }, children: [_jsx("option", { value: "", children: "Tous types" }), _jsx("option", { value: "CDI", children: "CDI" }), _jsx("option", { value: "CDD", children: "CDD" }), _jsx("option", { value: "Freelance", children: "Freelance" }), _jsx("option", { value: "Pr\u00E9station", children: "Pr\u00E9station" }), _jsx("option", { value: "Stage", children: "Stage" })] })] })] }) })) }), _jsxs("div", { style: {
                                            flex: 1,
                                            padding: showFilters ? '0px' : '0px 20px'
                                        }, children: [_jsx("div", { style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                    gap: '16px'
                                                }, children: filteredJobs.slice(0, 6).map((job, index) => (_jsxs("div", { style: {
                                                        padding: '20px',
                                                        backgroundColor: '#111',
                                                        borderRadius: '4px',
                                                        border: '1px solid #333',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.borderColor = '#ffcc00';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.borderColor = '#333';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }, onClick: () => navigate(`/jobs/${job.id}`), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: { margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }, children: job.title || 'Titre non disponible' }), _jsxs("div", { style: { color: '#888', fontSize: '12px', marginBottom: '8px' }, children: [job.company || 'Entreprise', " \u2022 ", job.location || 'Localisation'] }), _jsxs("div", { style: { fontSize: '12px', color: '#666' }, children: [job.contractType || 'Type de contrat', " \u2022 ", job.createdAt ? getTimeAgo(new Date(job.createdAt.seconds * 1000)) : 'Récent'] })] }), _jsx("div", { style: {
                                                                        backgroundColor: '#ffcc00',
                                                                        color: '#0a0a0a',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '10px',
                                                                        fontWeight: 'bold'
                                                                    }, children: "Disponible" })] }), _jsx("div", { style: { fontSize: '13px', color: '#ccc', lineHeight: '1.4', marginBottom: '12px' }, children: job.description ? (job.description.length > 80 ? job.description.substring(0, 80) + '...' : job.description) : 'Description non disponible' }), job.skills && (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: (Array.isArray(job.skills) ? job.skills : job.skills.split(',')).slice(0, 3).map((skill, skillIndex) => (_jsx("span", { style: {
                                                                    padding: '2px 6px',
                                                                    backgroundColor: '#333',
                                                                    color: '#ffcc00',
                                                                    borderRadius: '2px',
                                                                    fontSize: '10px'
                                                                }, children: typeof skill === 'string' ? skill.trim() : skill }, skillIndex))) }))] }, job.id || index))) }), filteredJobs.length === 0 && (_jsxs("div", { style: {
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    color: '#888'
                                                }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDD0D" }), _jsx("h3", { style: { color: '#f5f5f7', marginBottom: '8px' }, children: "Aucune opportunit\u00E9 trouv\u00E9e" }), _jsx("p", { children: "Essayez de modifier vos crit\u00E8res de recherche" })] }))] })] })] })] }), user && (_jsx(ProfileEditModal, { profile: user, isOpen: isEditModalOpen, onClose: () => {
                    console.log('🔍 Test: Fermeture de ProfileEditModal');
                    setIsEditModalOpen(false);
                }, onSave: handleSaveProfile })), isCalendarOpen && (_jsx(TalentAgendaView, { onClose: () => setIsCalendarOpen(false) })), isAppointmentsOpen && (_jsx(TalentAppointmentManager, { onClose: () => setIsAppointmentsOpen(false) }))] }));
}
