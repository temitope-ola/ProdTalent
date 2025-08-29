import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal';
import ContactModal from '../components/ContactModal';
const ProfilePage = () => {
    const { user } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                let userProfile = null;
                if (userId && userId !== user.id) {
                    // Charger le profil d'un autre utilisateur
                    userProfile = await FirestoreService.getProfileById(userId);
                    setIsOwnProfile(false);
                }
                else {
                    // Charger son propre profil en utilisant getProfileById
                    const userId = user.id;
                    userProfile = await FirestoreService.getProfileById(userId);
                    setIsOwnProfile(true);
                }
                setProfile(userProfile);
            }
            catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [user, userId, navigate]);
    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };
    const handleSaveProfile = async (updatedProfile) => {
        setProfile(updatedProfile);
        await FirestoreService.updateProfile(updatedProfile.id, updatedProfile.role, {
            displayName: updatedProfile.displayName,
            bio: updatedProfile.bio,
            skills: updatedProfile.skills,
            linkedinUrl: updatedProfile.linkedinUrl,
            githubUrl: updatedProfile.githubUrl,
            cvUrl: updatedProfile.cvUrl
        });
    };
    const handleLogout = async () => {
        try {
            await FirestoreService.signOut();
            navigate('/');
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    const handleDeleteAccount = async () => {
        if (!user || !profile)
            return;
        // Demander confirmation à l'utilisateur
        const isConfirmed = window.confirm('⚠️ ATTENTION : Cette action est irréversible !\n\n' +
            'Êtes-vous sûr de vouloir supprimer votre compte ?\n' +
            'Toutes vos données seront définitivement supprimées.');
        if (!isConfirmed)
            return;
        try {
            // Afficher une notification de chargement
            showNotification({
                type: 'info',
                title: 'Suppression en cours',
                message: 'Votre compte est en cours de suppression...'
            });
            // Supprimer le profil de Firestore
            await FirestoreService.deleteProfile(profile.id, profile.role);
            // Supprimer le compte utilisateur de Firebase Auth
            await FirestoreService.deleteUserAccount();
            // Afficher une notification de succès
            showNotification({
                type: 'success',
                title: 'Compte supprimé',
                message: 'Votre compte a été supprimé avec succès.'
            });
            // Rediriger vers la page d'accueil
            navigate('/');
        }
        catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Une erreur est survenue lors de la suppression de votre compte.'
            });
        }
    };
    const getBackLink = () => {
        // Récupérer le paramètre 'from' de l'URL
        const searchParams = new URLSearchParams(location.search);
        const from = searchParams.get('from');
        // Si l'utilisateur connecté est un coach
        if (user && user.role === 'coach') {
            if (from === 'coach-talents') {
                return '/coach/talents';
            }
            if (from === 'coach-recruteurs') {
                return '/coach/recruteurs';
            }
            // Sinon retourner au dashboard coach
            return '/dashboard/coach';
        }
        // Si l'utilisateur connecté est un recruteur
        if (user && user.role === 'recruteur') {
            if (from === 'recruiter-talents') {
                return '/talents';
            }
            // Sinon retourner au dashboard recruteur
            return '/dashboard/recruteur';
        }
        // Sinon retourner au dashboard approprié
        if (!profile)
            return '/';
        switch (profile.role) {
            case 'talent': return '/dashboard/talent';
            case 'recruteur': return '/dashboard/recruteur';
            case 'coach': return '/dashboard/coach';
            default: return '/';
        }
    };
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: "Chargement du profil..." }));
    }
    if (!profile) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: "Profil non trouv\u00E9" }));
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
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("button", { onClick: () => navigate(getBackLink()), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '12px'
                                    }, children: "Retour" }), _jsx("h1", { style: { margin: 0, color: '#ffcc00' }, children: isOwnProfile ? 'Mon Profil' : `Profil de ${profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur')}` })] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: _jsx("button", { onClick: handleLogout, style: {
                                    padding: '8px 16px',
                                    backgroundColor: '#333',
                                    color: '#f5f5f7',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }, children: "Se d\u00E9connecter" }) })] }), _jsxs("div", { style: { maxWidth: '800px', margin: '0 auto' }, children: [_jsx("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: 4,
                                border: 'transparent',
                                overflow: 'hidden',
                                marginBottom: 24
                            }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start' }, children: [_jsx("div", { style: {
                                            width: '150px',
                                            height: '150px',
                                            backgroundColor: '#ffcc00',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '4px 0 0 4px'
                                        }, children: _jsx(Avatar, { email: profile.email, src: profile.avatarUrl, size: "large", editable: isOwnProfile, onImageChange: async (file) => {
                                                try {
                                                    const avatarUrl = await FirestoreService.uploadAvatar(file);
                                                    await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                                                    setProfile({ ...profile, avatarUrl });
                                                }
                                                catch (error) {
                                                    console.error('Erreur lors de l\'upload de l\'avatar:', error);
                                                    showNotification({
                                                        type: 'error',
                                                        title: 'Erreur d\'upload',
                                                        message: 'Erreur lors de l\'upload de l\'avatar'
                                                    });
                                                }
                                            } }) }), _jsxs("div", { style: { flex: 1, padding: '24px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("h2", { style: { color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '24px' }, children: profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur') }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "R\u00F4le:" }), " ", profile.role] }), _jsxs("p", { style: { color: '#888', margin: '0' }, children: [_jsx("strong", { children: "Membre depuis:" }), " ", profile.createdAt.toLocaleDateString()] })] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: isOwnProfile ? (_jsx("button", { onClick: handleEditProfile, style: {
                                                                padding: '8px 16px',
                                                                backgroundColor: 'transparent',
                                                                color: '#ffcc00',
                                                                border: '1px solid #ffcc00',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                marginTop: '12px'
                                                            }, children: "Modifier" })) : (_jsx("button", { onClick: () => setIsContactModalOpen(true), style: {
                                                                padding: '8px 16px',
                                                                backgroundColor: '#ffcc00',
                                                                color: '#000',
                                                                border: '1px solid #ffcc00',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                marginTop: '12px',
                                                                fontWeight: 'bold'
                                                            }, children: "Contacter" })) })] }), profile.bio && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "Bio" }), _jsx("p", { style: { color: '#f5f5f7', margin: 0, lineHeight: '1.5' }, children: profile.bio })] })), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "Contact" }), _jsxs("p", { style: { color: '#f5f5f7', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "Email:" }), " ", profile.email] })] }), (profile.linkedinUrl || profile.githubUrl) && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "Liens" }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [profile.linkedinUrl && (_jsx("a", { href: profile.linkedinUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                                    color: '#ffcc00',
                                                                    textDecoration: 'none',
                                                                    fontSize: '14px',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #ffcc00',
                                                                    borderRadius: '4px'
                                                                }, children: "\uD83D\uDD17 LinkedIn" })), profile.githubUrl && (_jsx("a", { href: profile.githubUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                                    color: '#ffcc00',
                                                                    textDecoration: 'none',
                                                                    fontSize: '14px',
                                                                    padding: '4px 8px',
                                                                    border: '1px solid #ffcc00',
                                                                    borderRadius: '4px'
                                                                }, children: "\uD83D\uDC19 GitHub" }))] })] })), profile.cvUrl && (_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "CV" }), _jsx("a", { href: profile.cvUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                            color: '#ffcc00',
                                                            textDecoration: 'none',
                                                            fontSize: '14px',
                                                            padding: '4px 8px',
                                                            border: '1px solid #ffcc00',
                                                            borderRadius: '4px',
                                                            display: 'inline-block'
                                                        }, children: "\uD83D\uDCC4 Voir le CV" })] }))] })] }) }), profile.role === 'talent' && (_jsxs("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: 4,
                                padding: '20px',
                                marginBottom: 24
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "Comp\u00E9tences" }), profile.skills ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }, children: Array.isArray(profile.skills) ? (
                                    // Si c'est un tableau (nouveau format)
                                    profile.skills.map((skill, index) => (_jsx("span", { style: {
                                            backgroundColor: '#333',
                                            color: '#ffcc00',
                                            padding: '6px 12px',
                                            borderRadius: '15px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            border: '1px solid #555'
                                        }, children: skill }, index)))) : (
                                    // Si c'est une chaîne (ancien format)
                                    profile.skills.split(',').map((skill, index) => (_jsx("span", { style: {
                                            backgroundColor: '#333',
                                            color: '#ffcc00',
                                            padding: '6px 12px',
                                            borderRadius: '15px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            border: '1px solid #555'
                                        }, children: skill.trim() }, index)))) })) : (_jsx("p", { style: { color: '#888', margin: 0, fontStyle: 'italic' }, children: "Aucune comp\u00E9tence renseign\u00E9e" }))] })), profile.role === 'recruteur' && (_jsxs("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: 4,
                                padding: '20px',
                                marginBottom: 24
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "Entreprise" }), _jsx("p", { style: { color: '#f5f5f7', margin: 0 }, children: "Section pour afficher les informations de l'entreprise..." })] })), profile.role === 'coach' && (_jsxs("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: 4,
                                padding: '20px',
                                marginBottom: 24
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "Services de Coaching" }), _jsx("p", { style: { color: '#f5f5f7', margin: 0 }, children: "Section pour afficher les services de coaching..." })] })), isOwnProfile && (_jsxs("div", { style: {
                                backgroundColor: '#1a1a1a',
                                borderRadius: 4,
                                padding: '20px',
                                marginBottom: 24,
                                border: '1px solid #333'
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "\uD83D\uDD12 S\u00E9curit\u00E9 du compte" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx("p", { style: { color: '#f5f5f7', margin: 0, fontSize: '14px' }, children: "G\u00E9rez la s\u00E9curit\u00E9 de votre compte et vos donn\u00E9es personnelles." }), _jsxs("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: handleDeleteAccount, style: {
                                                        padding: '10px 16px',
                                                        backgroundColor: '#ff0000',
                                                        color: '#ffffff',
                                                        border: '2px solid #ff0000',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.backgroundColor = '#cc0000';
                                                        e.currentTarget.style.borderColor = '#cc0000';
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.backgroundColor = '#ff0000';
                                                        e.currentTarget.style.borderColor = '#ff0000';
                                                    }, title: "Supprimer d\u00E9finitivement votre compte et toutes vos donn\u00E9es", children: "\u26A0\uFE0F Supprimer mon compte" }), _jsx("button", { onClick: handleLogout, style: {
                                                        padding: '10px 16px',
                                                        backgroundColor: '#333',
                                                        color: '#f5f5f7',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }, children: "Se d\u00E9connecter" })] }), _jsx("p", { style: { color: '#888', margin: '8px 0 0 0', fontSize: '12px', fontStyle: 'italic' }, children: "\u26A0\uFE0F La suppression de compte est irr\u00E9versible. Toutes vos donn\u00E9es seront d\u00E9finitivement supprim\u00E9es." })] })] }))] }), isOwnProfile && profile && (_jsx(ProfileEditModal, { profile: profile, isOpen: isEditModalOpen, onClose: () => setIsEditModalOpen(false), onSave: handleSaveProfile })), profile && user && (_jsx(ContactModal, { isOpen: isContactModalOpen, onClose: () => setIsContactModalOpen(false), talentName: profile.displayName || profile.email.split('@')[0], talentEmail: profile.email, talentId: profile.id, fromUserProfile: user }))] }) }));
};
export default ProfilePage;
