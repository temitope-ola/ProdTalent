import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const TalentsListPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [talents, setTalents] = useState([]);
    const [filteredTalents, setFilteredTalents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        skills: '',
        availability: '',
        location: '',
        experience: ''
    });
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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
                setFilteredTalents(talentsList);
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

    // Screen width detection
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter talents when filters change
    useEffect(() => {
        applyFilters();
    }, [talents, activeFilters]);

    // Apply filters function
    const applyFilters = () => {
        let filtered = talents;
        // Filter by skills
        if (activeFilters.skills) {
            filtered = filtered.filter(talent => {
                if (!talent.skills) return false;
                const talentSkills = Array.isArray(talent.skills) 
                    ? talent.skills.map(skill => skill.toLowerCase())
                    : talent.skills.toLowerCase().split(/[,\s]+/).filter(skill => skill.trim());
                return talentSkills.some(skill => 
                    skill.includes(activeFilters.skills.toLowerCase()) || 
                    activeFilters.skills.toLowerCase().includes(skill)
                );
            });
        }
        // Filter by availability
        if (activeFilters.availability) {
            filtered = filtered.filter(talent => 
                talent.availability && talent.availability.toLowerCase().includes(activeFilters.availability.toLowerCase())
            );
        }
        // Filter by location
        if (activeFilters.location) {
            filtered = filtered.filter(talent => 
                talent.location && talent.location.toLowerCase().includes(activeFilters.location.toLowerCase())
            );
        }
        // Filter by experience
        if (activeFilters.experience) {
            filtered = filtered.filter(talent => 
                talent.experience && talent.experience.toLowerCase().includes(activeFilters.experience.toLowerCase())
            );
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
        navigate(`/profile/${talentId}?from=recruiter-talents`);
    };

    if (isLoading) {
        return _jsx("div", { 
            style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, 
            children: "Chargement des talents..." 
        });
    }

    return _jsx("div", { 
        style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, 
        children: _jsxs("div", { 
            style: {
                width: '1214px',
                maxWidth: '100%',
                padding: '24px'
            }, 
            children: [
                // Header
                _jsxs("header", { 
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        marginBottom: 24
                    }, 
                    children: [
                        _jsxs("div", { 
                            style: { display: 'flex', alignItems: 'center', gap: 16 }, 
                            children: [
                                _jsx("button", { 
                                    onClick: () => navigate('/dashboard/recruteur'), 
                                    style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }, 
                                    children: "← Retour" 
                                }), 
                                _jsxs("h1", { 
                                    style: { margin: 0, color: '#ffcc00' }, 
                                    children: ["Talents Disponibles (", filteredTalents.length, ")"] 
                                })
                            ] 
                        }), 
                        _jsx("button", { 
                            onClick: handleLogout, 
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, 
                            children: "Se déconnecter" 
                        })
                    ] 
                }),

                // Filtres Section
                _jsxs("div", { 
                    style: {
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px',
                        padding: '20px',
                        marginBottom: '20px'
                    }, 
                    children: [
                        // Header avec bouton filtre
                        _jsxs("div", { 
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }, 
                            children: [
                                _jsx("div", { 
                                    style: { display: 'flex', alignItems: 'center', gap: '16px' }, 
                                    children: 
                                        // Bouton filtre toggle
                                        _jsxs("div", { 
                                            onClick: () => setShowFilters(!showFilters), 
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: '#333',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }, 
                                            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', 
                                            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', 
                                            children: [
                                                _jsxs("div", { 
                                                    style: {
                                                        width: '16px',
                                                        height: '16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between'
                                                    }, 
                                                    children: [
                                                        _jsx("div", { style: { width: '100%', height: '2px', backgroundColor: '#ffcc00' } }), 
                                                        _jsx("div", { style: { width: '75%', height: '2px', backgroundColor: '#ffcc00' } }), 
                                                        _jsx("div", { style: { width: '50%', height: '2px', backgroundColor: '#ffcc00' } })
                                                    ] 
                                                }), 
                                                _jsx("span", { 
                                                    style: { fontSize: '14px', color: '#ffcc00' }, 
                                                    children: showFilters ? 'Fermer' : 'Filtrer' 
                                                })
                                            ] 
                                        }) 
                                }), 
                                _jsx("span", { 
                                    style: { fontSize: '14px', color: '#888' }, 
                                    children: "Page 1" 
                                })
                            ] 
                        }),

                        // Filtres
                        showFilters && _jsx("div", { 
                            style: {
                                width: '100%',
                                backgroundColor: '#0a0a0a',
                                borderRadius: '4px',
                                padding: '20px',
                                marginBottom: '20px'
                            }, 
                            children: _jsxs("div", { 
                                children: [
                                    _jsxs("div", { 
                                        style: { 
                                            display: 'grid',
                                            gridTemplateColumns: screenWidth <= 480 ? '1fr' : screenWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                                            gap: '16px' 
                                        }, 
                                        children: [
                                            // Compétences
                                            _jsxs("div", { 
                                                children: [
                                                    _jsx("span", { 
                                                        style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }, 
                                                        children: "Compétences" 
                                                    }), 
                                                    _jsx("input", { 
                                                        type: "text", 
                                                        placeholder: "ex: React, Python...", 
                                                        value: activeFilters.skills, 
                                                        onChange: (e) => handleFilterChange('skills', e.target.value), 
                                                        style: {
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '13px'
                                                        } 
                                                    })
                                                ] 
                                            }),

                                            // Disponibilité
                                            _jsxs("div", { 
                                                children: [
                                                    _jsx("span", { 
                                                        style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }, 
                                                        children: "Disponibilité" 
                                                    }), 
                                                    _jsxs("select", { 
                                                        value: activeFilters.availability, 
                                                        onChange: (e) => handleFilterChange('availability', e.target.value), 
                                                        style: {
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '13px'
                                                        }, 
                                                        children: [
                                                            _jsx("option", { value: "", children: "Toutes" }), 
                                                            _jsx("option", { value: "immédiate", children: "Immédiate" }), 
                                                            _jsx("option", { value: "1 mois", children: "Dans 1 mois" }), 
                                                            _jsx("option", { value: "2 mois", children: "Dans 2 mois" }), 
                                                            _jsx("option", { value: "3 mois", children: "Dans 3 mois+" })
                                                        ] 
                                                    })
                                                ] 
                                            }),

                                            // Localisation
                                            _jsxs("div", { 
                                                children: [
                                                    _jsx("span", { 
                                                        style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }, 
                                                        children: "Localisation" 
                                                    }), 
                                                    _jsx("input", { 
                                                        type: "text", 
                                                        placeholder: "ex: Paris, Lyon...", 
                                                        value: activeFilters.location, 
                                                        onChange: (e) => handleFilterChange('location', e.target.value), 
                                                        style: {
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '13px'
                                                        } 
                                                    })
                                                ] 
                                            }),

                                            // Expérience
                                            _jsxs("div", { 
                                                children: [
                                                    _jsx("span", { 
                                                        style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }, 
                                                        children: "Expérience" 
                                                    }), 
                                                    _jsxs("select", { 
                                                        value: activeFilters.experience, 
                                                        onChange: (e) => handleFilterChange('experience', e.target.value), 
                                                        style: {
                                                            width: '100%',
                                                            padding: '8px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '13px'
                                                        }, 
                                                        children: [
                                                            _jsx("option", { value: "", children: "Tous niveaux" }), 
                                                            _jsx("option", { value: "junior", children: "Junior (0-2 ans)" }), 
                                                            _jsx("option", { value: "confirmé", children: "Confirmé (3-5 ans)" }), 
                                                            _jsx("option", { value: "senior", children: "Senior (5+ ans)" })
                                                        ] 
                                                    })
                                                ] 
                                            })
                                        ] 
                                    }), 
                                    
                                    // Bouton Reset
                                    _jsx("button", { 
                                        onClick: () => setActiveFilters({ skills: '', availability: '', location: '', experience: '' }), 
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            marginTop: '16px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '13px'
                                        }, 
                                        children: "Réinitialiser" 
                                    })
                                ] 
                            }) 
                        })
                    ] 
                }),

                // Talents Grid
                _jsx("div", { 
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 20
                    }, 
                    children: filteredTalents.map(talent => _jsxs("div", { 
                        style: {
                            backgroundColor: '#111',
                            borderRadius: 8,
                            padding: 20,
                            border: '1px solid #333'
                        }, 
                        children: [
                            // Talent Header
                            _jsxs("div", { 
                                style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }, 
                                children: [
                                    _jsx(Avatar, { 
                                        email: talent.email, 
                                        src: talent.avatarUrl, 
                                        size: "medium", 
                                        editable: false 
                                    }), 
                                    _jsxs("div", { 
                                        children: [
                                            _jsx("h3", { 
                                                style: {
                                                    color: '#f5f5f7',
                                                    margin: '0 0 4px 0',
                                                    fontSize: '18px'
                                                }, 
                                                children: talent.displayName || talent.email.split('@')[0] 
                                            }), 
                                            _jsx("p", { 
                                                style: {
                                                    color: '#888',
                                                    margin: 0,
                                                    fontSize: '14px'
                                                }, 
                                                children: talent.email 
                                            })
                                        ] 
                                    })
                                ] 
                            }),

                            // Bio Preview
                            talent.bio && _jsx("div", { 
                                style: { marginBottom: 16 }, 
                                children: _jsx("p", { 
                                    style: {
                                        color: '#f5f5f7',
                                        margin: 0,
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }, 
                                    children: talent.bio 
                                }) 
                            }),

                            // Skills Preview
                            talent.skills && _jsxs("div", { 
                                style: { marginBottom: 16 }, 
                                children: [
                                    _jsx("p", { 
                                        style: {
                                            color: '#888',
                                            margin: '0 0 4px 0',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }, 
                                        children: "Compétences" 
                                    }), 
                                    _jsx("p", { 
                                        style: {
                                            color: '#f5f5f7',
                                            margin: 0,
                                            fontSize: '13px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }, 
                                        children: talent.skills 
                                    })
                                ] 
                            }),

                            // Action Buttons
                            _jsx("div", { 
                                style: { display: 'flex', gap: 8 }, 
                                children: _jsx("button", { 
                                    onClick: () => handleViewProfile(talent.id), 
                                    style: {
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, 
                                    children: "Voir le profil" 
                                }) 
                            })
                        ] 
                    }, talent.id)) 
                }),

                // Messages d'état
                filteredTalents.length === 0 && talents.length > 0 && _jsxs("div", { 
                    style: {
                        textAlign: 'center',
                        padding: '40px',
                        color: '#888'
                    }, 
                    children: [
                        _jsx("div", { 
                            style: { fontSize: '48px', marginBottom: '16px' }, 
                            children: "🔍" 
                        }), 
                        _jsx("h3", { 
                            style: { color: '#f5f5f7', marginBottom: '8px' }, 
                            children: "Aucun talent trouvé" 
                        }), 
                        _jsx("p", { 
                            children: "Essayez de modifier vos critères de recherche" 
                        })
                    ] 
                }),

                talents.length === 0 && _jsxs("div", { 
                    style: {
                        textAlign: 'center',
                        padding: '40px',
                        color: '#888'
                    }, 
                    children: [
                        _jsx("div", { 
                            style: { fontSize: '48px', marginBottom: '16px' }, 
                            children: "👨‍💼" 
                        }), 
                        _jsx("h3", { 
                            style: { color: '#f5f5f7', marginBottom: '8px' }, 
                            children: "Aucun talent disponible" 
                        }), 
                        _jsx("p", { 
                            children: "Aucun talent n'est disponible pour le moment" 
                        })
                    ] 
                })
            ] 
        }) 
    });
};

export default TalentsListPage;