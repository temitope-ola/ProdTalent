import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';
export default function RecruiterDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [talents, setTalents] = useState([]);
    const [loading, setLoading] = useState(false);
    // Redirection si l'utilisateur n'est pas un recruteur
    useEffect(() => {
        if (user && user.role !== 'recruteur') {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    // Charger le profil et les talents
    useEffect(() => {
        if (user) {
            loadProfile();
            loadTalents();
        }
    }, [user]);
    const loadProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
            setProfile(userProfile);
        }
        catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadTalents = async () => {
        if (!user)
            return;
        try {
            const talentsList = await FirestoreService.getAllTalents();
            setTalents(talentsList);
        }
        catch (error) {
            console.error('Erreur lors du chargement des talents:', error);
        }
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
            await logout();
            navigate('/', { replace: true });
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    const handleCreateJob = () => {
        navigate('/create-job');
    };
    const handleViewApplications = () => {
        navigate('/applications');
    };
    const handleSearchTalents = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'La recherche de talents sera bientôt disponible'
        });
        // Ici vous pourriez naviguer vers une page de recherche avancée
    };
    const handleOpenMessages = () => {
        navigate('/messages');
    };
    const handleViewMyJobs = () => {
        navigate('/my-jobs');
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
            }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        padding: '0 24px 16px 24px'
                    }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }, children: [_jsx("h1", { style: { margin: 0, color: '#f5f5f7', fontSize: '24px', fontWeight: 'bold' }, children: "ProdTalent" }), _jsx("span", { style: { color: '#ffcc00', fontSize: '14px', marginTop: '4px' }, children: "Recruteur Dashboard" })] }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Se d\u00E9connecter" })] }), _jsxs("section", { style: { marginTop: 24, padding: '0 24px' }, children: [_jsxs("h2", { style: { color: '#ffcc00' }, children: ["Bienvenue ", user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur')] }), _jsx("p", { children: "G\u00E9rez vos annonces, candidatures et trouvez les meilleurs talents." }), profile && (_jsx("div", { style: {
                                marginBottom: 24,
                                marginTop: 24,
                                padding: 0,
                                backgroundColor: '#111',
                                borderRadius: 4,
                                border: 'transparent',
                                overflow: 'hidden',
                                height: '150px'
                            }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start' }, children: [_jsx("div", { style: {
                                            width: '150px',
                                            height: '150px',
                                            backgroundColor: '#ffcc00',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px 0 0 4px'
                                        }, children: _jsx(Avatar, { email: profile.email, src: profile.avatarUrl, size: "large", editable: true, onImageChange: async (file) => {
                                                try {
                                                    const avatarUrl = await FirestoreService.uploadAvatar(file);
                                                    await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                                                    // Recharger le profil
                                                    const updatedProfile = await FirestoreService.getCurrentProfile(profile.id, profile.role);
                                                    if (updatedProfile) {
                                                        setProfile(updatedProfile);
                                                    }
                                                }
                                                catch (error) {
                                                    console.error('Erreur lors de l\'upload de l\'avatar:', error);
                                                }
                                            } }) }), _jsx("div", { style: { flex: 1, padding: '20px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '12px' }, children: "Mon Profil" }), _jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0' }, children: profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur') }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "R\u00F4le:" }), " ", profile.role] }), _jsxs("p", { style: { color: '#888', margin: '0' }, children: [_jsx("strong", { children: "Membre depuis:" }), " ", profile.createdAt.toLocaleDateString()] })] }), _jsx("button", { onClick: () => navigate('/profile'), style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: 'transparent',
                                                        color: '#ffcc00',
                                                        border: '0.5px solid #ffcc00',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        marginTop: '12px',
                                                        width: '140px',
                                                        textAlign: 'left',
                                                        alignSelf: 'flex-end'
                                                    }, children: "Voir Profil Complet" })] }) }), profile.bio && (_jsx("div", { style: { padding: '0 20px 20px 20px' }, children: _jsxs("p", { style: { color: '#f5f5f7', marginTop: '12px' }, children: [_jsx("strong", { children: "Bio:" }), " ", profile.bio] }) }))] }) })), _jsxs("div", { style: {
                                marginBottom: 24,
                                padding: 20,
                                backgroundColor: '#111',
                                borderRadius: 4,
                                border: 'transparent'
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Statistiques" }), _jsxs("p", { style: { color: '#f5f5f7', fontWeight: 500 }, children: ["Talents disponibles: ", talents.length] })] }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: 24,
                                marginTop: 32
                            }, children: [_jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes Annonces" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Cr\u00E9ez et g\u00E9rez vos offres d'emploi" }), _jsxs("div", { style: { display: 'flex', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: handleCreateJob, style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: 'transparent',
                                                        color: '#ffcc00',
                                                        border: '0.5px solid #ffcc00',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        width: '140px',
                                                        textAlign: 'left'
                                                    }, children: "Cr\u00E9er une annonce" }), _jsx("button", { onClick: handleViewMyJobs, style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: 'transparent',
                                                        color: '#ffcc00',
                                                        border: '0.5px solid #ffcc00',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        width: '140px',
                                                        textAlign: 'left'
                                                    }, children: "Mes annonces" })] })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Talents Disponibles" }), _jsxs("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: ["D\u00E9couvrez des talents qualifi\u00E9s (", talents.length, " disponibles)"] }), _jsx("button", { onClick: () => navigate('/talents'), style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les profils" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Recommandations" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Recommandations de talents par les coaches" }), _jsx("button", { onClick: () => navigate('/recommendations'), style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les recommandations" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Candidatures" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Consultez et g\u00E9rez les candidatures re\u00E7ues" }), _jsx("button", { onClick: handleViewApplications, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les candidatures" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Messages" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Communiquez avec les talents et coaches" }), _jsx("button", { onClick: handleOpenMessages, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Ouvrir les messages" })] })] })] })] }) }));
}
