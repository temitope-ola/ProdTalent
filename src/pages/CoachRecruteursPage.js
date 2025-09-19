import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';
const CoachRecruteursPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recruteurs, setRecruteurs] = useState([]);
    const [filteredRecruteurs, setFilteredRecruteurs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        location: '',
        company: '',
        industry: '',
        experience: ''
    });
    useEffect(() => {
        const loadRecruteurs = async () => {
            if (!user) {
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                const recruteursList = await FirestoreService.getAllRecruteurs();
                setRecruteurs(recruteursList);
            }
            catch (error) {
                console.error('Erreur lors du chargement des recruteurs:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadRecruteurs();
    }, [user, navigate]);
    // Filter recruiters when filters change
    useEffect(() => {
        applyFilters();
    }, [recruteurs, activeFilters]);
    // Close profile menu when clicking outside
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
    // Apply filters function
    const applyFilters = () => {
        let filtered = recruteurs;
        // Filter by location
        if (activeFilters.location) {
            filtered = filtered.filter(recruteur => recruteur.location && recruteur.location.toLowerCase().includes(activeFilters.location.toLowerCase()));
        }
        // Filter by company
        if (activeFilters.company) {
            filtered = filtered.filter(recruteur => recruteur.company && recruteur.company.toLowerCase().includes(activeFilters.company.toLowerCase()));
        }
        // Filter by industry
        if (activeFilters.industry) {
            filtered = filtered.filter(recruteur => recruteur.industry && recruteur.industry.toLowerCase().includes(activeFilters.industry.toLowerCase()));
        }
        // Filter by experience
        if (activeFilters.experience) {
            filtered = filtered.filter(recruteur => recruteur.experience && recruteur.experience.toLowerCase().includes(activeFilters.experience.toLowerCase()));
        }
        setFilteredRecruteurs(filtered);
    };
    // Filter handlers
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
    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };
    const handleProfileAction = (action) => {
        setShowProfileMenu(false);
        switch (action) {
            case 'profile':
                navigate('/profile');
                break;
            case 'logout':
                handleLogout();
                break;
        }
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
    const handleViewProfile = (recruteurId) => {
        navigate(`/profile/${recruteurId}?from=coach-recruteurs`);
    };
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: "Chargement des recruteurs..." }));
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, children: _jsxs("div", { style: {
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
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsx("button", { onClick: () => navigate('/dashboard/coach'), style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        backgroundColor: '#333',
                                        color: '#ffcc00',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = '#ffcc00';
                                        e.currentTarget.style.color = '#0a0a0a';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = '#333';
                                        e.currentTarget.style.color = '#ffcc00';
                                    }, children: "\u2190 Retour" }), _jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "Mes Recruteurs" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '12px' }, children: "Connectez-vous avec les recruteurs actifs" })] })] }), _jsxs("div", { style: { position: 'relative' }, "data-profile-menu": true, children: [_jsxs("div", { onClick: handleProfileClick, style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        backgroundColor: '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsx(Avatar, { src: undefined, alt: user?.email ? user.email.split('@')[0] : 'Utilisateur', size: "small" }), _jsx("span", { style: { fontSize: '13px', color: '#f5f5f7' }, children: user?.email ? user.email.split('@')[0] : 'Utilisateur' }), _jsx("span", { style: {
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
                                        border: 'none',
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
                                            }, children: _jsxs("h2", { style: { margin: 0, color: '#ffcc00' }, children: ["Tous les recruteurs (", filteredRecruteurs.length, ")"] }) })] }), _jsx("span", { style: { fontSize: '14px', color: '#888' }, children: "Page 1" })] }), _jsxs("div", { style: { display: 'flex', gap: '20px' }, children: [_jsx("div", { style: {
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
                                                            }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Localisation" }), activeFilters.location && (_jsx("button", { onClick: () => clearFilter('location'), style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ff6b6b',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Effacer" }))] }), _jsx("input", { type: "text", placeholder: "ex: Paris, Lyon...", value: activeFilters.location, onChange: (e) => handleFilterChange('location', e.target.value), style: {
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
                                                            }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Entreprise" }), activeFilters.company && (_jsx("button", { onClick: () => clearFilter('company'), style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ff6b6b',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Effacer" }))] }), _jsx("input", { type: "text", placeholder: "ex: Google, Microsoft...", value: activeFilters.company, onChange: (e) => handleFilterChange('company', e.target.value), style: {
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
                                                            }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Secteur" }), activeFilters.industry && (_jsx("button", { onClick: () => clearFilter('industry'), style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ff6b6b',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Effacer" }))] }), _jsx("input", { type: "text", placeholder: "ex: Tech, Finance...", value: activeFilters.industry, onChange: (e) => handleFilterChange('industry', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '8px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            } })] })] }) })) }), _jsxs("div", { style: {
                                        flex: 1,
                                        padding: showFilters ? '0px' : '0px 20px'
                                    }, children: [_jsx("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                gap: '16px'
                                            }, children: filteredRecruteurs.slice(0, 12).map((recruteur, index) => (_jsxs("div", { style: {
                                                    padding: '20px',
                                                    backgroundColor: '#111',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.borderColor = '#ffcc00';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.borderColor = '#333';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }, onClick: () => handleViewProfile(recruteur.id), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }, children: [_jsx(Avatar, { src: recruteur.avatarUrl, alt: recruteur.displayName || recruteur.email, size: "medium" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: { margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }, children: recruteur.displayName || recruteur.email.split('@')[0] }), _jsxs("div", { style: { color: '#888', fontSize: '12px', marginBottom: '4px' }, children: [recruteur.company || 'Entreprise', " \u2022 ", recruteur.location || 'Localisation'] })] })] }), _jsx("div", { style: {
                                                                    backgroundColor: '#ffcc00',
                                                                    color: '#0a0a0a',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold'
                                                                }, children: "Actif" })] }), _jsx("div", { style: { fontSize: '13px', color: '#ccc', lineHeight: '1.4', marginBottom: '12px' }, children: recruteur.bio ? (recruteur.bio.length > 80 ? recruteur.bio.substring(0, 80) + '...' : recruteur.bio) : 'Expert en recrutement de talents' }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: [recruteur.industry && (_jsx("span", { style: {
                                                                    padding: '2px 6px',
                                                                    backgroundColor: '#333',
                                                                    color: '#ffcc00',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px'
                                                                }, children: recruteur.industry })), recruteur.company && (_jsx("span", { style: {
                                                                    padding: '2px 6px',
                                                                    backgroundColor: '#333',
                                                                    color: '#888',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px'
                                                                }, children: recruteur.company }))] })] }, recruteur.id || index))) }), filteredRecruteurs.length === 0 && (_jsxs("div", { style: {
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#888'
                                            }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDC54" }), _jsx("h3", { style: { color: '#f5f5f7', marginBottom: '8px' }, children: "Aucun recruteur trouv\u00E9" }), _jsx("p", { children: "Essayez de modifier vos crit\u00E8res de recherche" })] }))] })] })] })] }) }));
};
export default CoachRecruteursPage;
