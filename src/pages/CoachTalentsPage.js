import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';
const CoachTalentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [talents, setTalents] = useState([]);
    const [filteredTalents, setFilteredTalents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        skills: '',
        availability: '',
        location: '',
        experience: ''
    });
    useEffect(() => {
        const loadTalents = async () => {
            if (!user) {
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                const talentsList = await FirestoreService.getAllTalents();
                setTalents(talentsList);
            }
            catch (error) {
                console.error('Erreur lors du chargement des talents:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadTalents();
    }, [user, navigate]);
    // Filter talents when filters change
    useEffect(() => {
        applyFilters();
    }, [talents, activeFilters]);
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
        let filtered = talents;
        // Filter by skills
        if (activeFilters.skills) {
            filtered = filtered.filter(talent => {
                if (!talent.skills)
                    return false;
                const talentSkills = Array.isArray(talent.skills)
                    ? talent.skills.map((skill) => skill.toLowerCase())
                    : talent.skills.toLowerCase().split(/[,\s]+/).filter((skill) => skill.trim());
                return talentSkills.some((skill) => skill.includes(activeFilters.skills.toLowerCase()) ||
                    activeFilters.skills.toLowerCase().includes(skill));
            });
        }
        // Filter by availability
        if (activeFilters.availability) {
            filtered = filtered.filter(talent => talent.availability && talent.availability.toLowerCase().includes(activeFilters.availability.toLowerCase()));
        }
        // Filter by location
        if (activeFilters.location) {
            filtered = filtered.filter(talent => talent.location && talent.location.toLowerCase().includes(activeFilters.location.toLowerCase()));
        }
        // Filter by experience
        if (activeFilters.experience) {
            filtered = filtered.filter(talent => talent.experience && talent.experience.toLowerCase().includes(activeFilters.experience.toLowerCase()));
        }
        setFilteredTalents(filtered);
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
    const handleViewProfile = (talentId) => {
        navigate(`/profile/${talentId}?from=coach-talents`);
    };
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: "Chargement des talents..." }));
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
                                        border: '1px solid #ffcc00',
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
                                    }, children: "\u2190 Retour" }), _jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "Mes Talents" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '12px' }, children: "Accompagnez et g\u00E9rez vos talents" })] })] }), _jsxs("div", { style: { position: 'relative' }, "data-profile-menu": true, children: [_jsxs("div", { onClick: handleProfileClick, style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        backgroundColor: '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsx(Avatar, { email: user?.email || '', src: user?.avatarUrl, size: "small", editable: false }), _jsx("span", { style: { fontSize: '13px', color: '#f5f5f7' }, children: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Utilisateur') }), _jsx("span", { style: {
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
                                            }, children: _jsxs("h2", { style: { margin: 0, color: '#ffcc00' }, children: ["Tous les talents (", filteredTalents.length, ")"] }) })] }), _jsx("span", { style: { fontSize: '14px', color: '#888' }, children: "Page 1" })] }), _jsxs("div", { style: { display: 'flex', gap: '20px' }, children: [_jsx("div", { style: {
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
                                                            }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Disponibilit\u00E9" }), activeFilters.availability && (_jsx("button", { onClick: () => clearFilter('availability'), style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ff6b6b',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Effacer" }))] }), _jsxs("select", { value: activeFilters.availability, onChange: (e) => handleFilterChange('availability', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '8px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }, children: [_jsx("option", { value: "", children: "Toutes" }), _jsx("option", { value: "imm\u00E9diate", children: "Imm\u00E9diate" }), _jsx("option", { value: "1 mois", children: "Dans 1 mois" }), _jsx("option", { value: "2 mois", children: "Dans 2 mois" }), _jsx("option", { value: "3 mois", children: "Dans 3 mois+" })] })] }), _jsxs("div", { children: [_jsxs("div", { style: {
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
                                                            }, children: [_jsx("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: "Exp\u00E9rience" }), activeFilters.experience && (_jsx("button", { onClick: () => clearFilter('experience'), style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ff6b6b',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Effacer" }))] }), _jsxs("select", { value: activeFilters.experience, onChange: (e) => handleFilterChange('experience', e.target.value), style: {
                                                                width: '100%',
                                                                padding: '8px',
                                                                backgroundColor: '#333',
                                                                color: '#f5f5f7',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }, children: [_jsx("option", { value: "", children: "Tous niveaux" }), _jsx("option", { value: "junior", children: "Junior (0-2 ans)" }), _jsx("option", { value: "confirm\u00E9", children: "Confirm\u00E9 (3-5 ans)" }), _jsx("option", { value: "senior", children: "Senior (5+ ans)" })] })] })] }) })) }), _jsxs("div", { style: {
                                        flex: 1,
                                        padding: showFilters ? '0px' : '0px 20px'
                                    }, children: [_jsx("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                gap: '16px'
                                            }, children: filteredTalents.slice(0, 12).map((talent, index) => (_jsxs("div", { style: {
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
                                                }, onClick: () => handleViewProfile(talent.id), children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }, children: [_jsx(Avatar, { email: talent.email, src: talent.avatarUrl, size: "medium", editable: false }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: { margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }, children: talent.displayName || talent.email.split('@')[0] }), _jsxs("div", { style: { color: '#888', fontSize: '12px', marginBottom: '4px' }, children: [talent.email, " \u2022 ", talent.location || 'Localisation'] })] })] }), _jsx("div", { style: {
                                                                    backgroundColor: '#ffcc00',
                                                                    color: '#0a0a0a',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '10px',
                                                                    fontWeight: 'bold'
                                                                }, children: "Disponible" })] }), _jsx("div", { style: { fontSize: '13px', color: '#ccc', lineHeight: '1.4', marginBottom: '12px' }, children: talent.bio ? (talent.bio.length > 80 ? talent.bio.substring(0, 80) + '...' : talent.bio) : 'Talent expérimenté prêt pour de nouveaux défis' }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px' }, children: [talent.skills && (_jsx("span", { style: {
                                                                    padding: '2px 6px',
                                                                    backgroundColor: '#333',
                                                                    color: '#ffcc00',
                                                                    borderRadius: '2px',
                                                                    fontSize: '10px'
                                                                }, children: typeof talent.skills === 'string'
                                                                    ? talent.skills.split(',')[0].trim()
                                                                    : talent.skills[0] || 'Compétences' })), talent.availability && (_jsx("span", { style: {
                                                                    padding: '2px 6px',
                                                                    backgroundColor: '#333',
                                                                    color: '#888',
                                                                    borderRadius: '2px',
                                                                    fontSize: '10px'
                                                                }, children: talent.availability }))] })] }, talent.id || index))) }), filteredTalents.length === 0 && (_jsxs("div", { style: {
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#888'
                                            }, children: [_jsx("div", { style: { fontSize: '48px', marginBottom: '16px' }, children: "\uD83D\uDC68\u200D\uD83D\uDCBC" }), _jsx("h3", { style: { color: '#f5f5f7', marginBottom: '8px' }, children: "Aucun talent trouv\u00E9" }), _jsx("p", { children: "Essayez de modifier vos crit\u00E8res de recherche" })] }))] })] })] })] }) }));
};
export default CoachTalentsPage;
