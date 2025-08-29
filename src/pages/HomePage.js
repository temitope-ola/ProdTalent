import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FeaturedTalentsService } from '../services/featuredTalentsService';
export default function HomePage() {
    const { user, signUp, login } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const [mode, setMode] = React.useState('login');
    const [role, setRole] = React.useState('talent');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);
    const [featuredTalents, setFeaturedTalents] = React.useState([]);
    const [loadingTalents, setLoadingTalents] = React.useState(true);
    // Détecter la taille d'écran
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    // Charger les talents mis en avant
    React.useEffect(() => {
        const loadFeaturedTalents = async () => {
            try {
                const talents = await FeaturedTalentsService.getFeaturedTalents();
                setFeaturedTalents(talents);
            }
            catch (error) {
                console.error('Erreur lors du chargement des talents:', error);
            }
            finally {
                setLoadingTalents(false);
            }
        };
        loadFeaturedTalents();
    }, []);
    React.useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setSuccess(null);
        try {
            if (mode === 'signup') {
                await signUp(email, password, role);
                setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
                setTimeout(() => {
                    navigate(`/dashboard/${role}`, { replace: true });
                }, 2000);
            }
            else {
                await login(email, password);
                setSuccess('Connexion réussie !');
            }
            setOpen(false);
        }
        catch (err) {
            console.error('Erreur auth:', err);
            if (err.message.includes('Invalid login credentials')) {
                setError('Email ou mot de passe incorrect');
            }
            else if (err.message.includes('Email not confirmed')) {
                setError('Veuillez confirmer votre email avant de vous connecter');
            }
            else if (err.message.includes('User already registered')) {
                setError('Un compte existe déjà avec cet email');
            }
            else {
                setError(err.message || 'Une erreur est survenue');
            }
        }
        finally {
            setBusy(false);
        }
    };
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setError(null);
        setSuccess(null);
    };
    const handleModeChange = (newMode) => {
        setMode(newMode);
        resetForm();
    };
    return (_jsxs("main", { style: {
            padding: 0,
            color: '#f5f5f7',
            backgroundColor: '#0a0a0a',
            minHeight: '100vh',
            width: '100%'
        }, children: [_jsx("header", { style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: 'rgba(10, 10, 10, 0.4)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }, children: _jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '1214px',
                        maxWidth: '100%'
                    }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }, children: [_jsx("h1", { style: {
                                        margin: 0,
                                        color: '#ffcc00',
                                        fontSize: '28px',
                                        fontWeight: '700'
                                    }, children: "ProdTalent" }), _jsx("span", { style: {
                                        color: '#61bfac',
                                        fontSize: '12px',
                                        marginTop: '2px',
                                        fontWeight: '500'
                                    }, children: "Un produit d'Edacy" })] }), _jsxs("div", { style: {
                                display: isMobile ? 'none' : 'flex',
                                gap: 12
                            }, children: [_jsx("button", { onClick: () => { handleModeChange('login'); setOpen(true); }, style: {
                                        padding: '10px 20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }, children: "Se connecter" }), _jsx("button", { onClick: () => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }, style: {
                                        padding: '10px 20px',
                                        backgroundColor: '#ffcc00',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }, children: "S'inscrire" })] }), _jsxs("button", { onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), style: {
                                display: isMobile ? 'flex' : 'none',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px'
                            }, children: [_jsx("div", { style: {
                                        width: '24px',
                                        height: '2px',
                                        backgroundColor: '#f5f5f7',
                                        marginBottom: '4px',
                                        transition: 'all 0.3s ease',
                                        transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                                    } }), _jsx("div", { style: {
                                        width: '24px',
                                        height: '2px',
                                        backgroundColor: '#f5f5f7',
                                        marginBottom: '4px',
                                        transition: 'all 0.3s ease',
                                        opacity: isMobileMenuOpen ? 0 : 1
                                    } }), _jsx("div", { style: {
                                        width: '24px',
                                        height: '2px',
                                        backgroundColor: '#f5f5f7',
                                        transition: 'all 0.3s ease',
                                        transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
                                    } })] })] }) }), isMobileMenuOpen && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px'
                }, children: _jsxs("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '300px'
                    }, children: [_jsx("button", { onClick: () => {
                                handleModeChange('login');
                                setOpen(true);
                                setIsMobileMenuOpen(false);
                            }, style: {
                                padding: '16px 24px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#f5f5f7',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                width: '100%'
                            }, children: "Se connecter" }), _jsx("button", { onClick: () => {
                                handleModeChange('signup');
                                setRole('recruteur');
                                setOpen(true);
                                setIsMobileMenuOpen(false);
                            }, style: {
                                padding: '16px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: '1px solid #ffcc00',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                width: '100%'
                            }, children: "S'inscrire" }), _jsx("button", { onClick: () => setIsMobileMenuOpen(false), style: {
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: '#888',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginTop: '20px'
                            }, children: "Fermer" })] }) })), _jsxs("section", { style: {
                    position: 'relative',
                    padding: isMobile ? '80px 0 60px' : '140px 0 100px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                    width: '100%'
                }, children: [_jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at 20% 80%, rgba(255, 204, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(97, 191, 172, 0.05) 0%, transparent 50%)',
                            animation: 'pulse 4s ease-in-out infinite alternate'
                        } }), _jsxs("div", { style: {
                            position: 'relative',
                            zIndex: 2,
                            maxWidth: '1214px',
                            margin: '0 auto',
                            padding: isMobile ? '0 16px' : '0 24px'
                        }, children: [_jsx("h2", { style: {
                                    fontSize: isMobile ? '2.5rem' : '4.5rem',
                                    marginBottom: '32px',
                                    color: '#ffcc00',
                                    fontWeight: '800',
                                    lineHeight: '1.1',
                                    letterSpacing: '-0.02em',
                                    maxWidth: '800px',
                                    margin: '0 auto 32px'
                                }, children: "Le talent ne tient pas sur une page," }), _jsx("p", { style: {
                                    fontSize: isMobile ? '1.8rem' : '3.2rem',
                                    color: '#f5f5f7',
                                    marginBottom: isMobile ? '40px' : '60px',
                                    fontWeight: '700',
                                    lineHeight: '1.2'
                                }, children: "Rencontrez-le." }), _jsx("p", { style: {
                                    fontSize: isMobile ? '1rem' : '1.3rem',
                                    color: '#f5f5f7',
                                    marginBottom: isMobile ? '40px' : '80px',
                                    fontWeight: '400',
                                    maxWidth: '600px',
                                    margin: '0 auto 100px',
                                    lineHeight: '1.5',
                                    opacity: '0.9'
                                }, children: "ProdTalent est une initiative d'Edacy qui met en lumi\u00E8re le potentiel unique de ses talents. Notre ambition est de d\u00E9passer le simple CV pour r\u00E9v\u00E9ler les parcours, les comp\u00E9tences et l'\u00E9nergie cr\u00E9ative de chacun. Avec ProdTalent, nous donnons aux talents la visibilit\u00E9 qu'ils m\u00E9ritent et offrons aux entreprises l'opportunit\u00E9 de rencontrer des profils qui feront la diff\u00E9rence.          " }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: isMobile ? '40px' : '100px',
                                    marginBottom: isMobile ? '60px' : '100px',
                                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                                }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("img", { src: "/icons/students.png", alt: "\u00C9tudiants", style: {
                                                    width: isMobile ? '36px' : '48px',
                                                    height: isMobile ? '36px' : '48px',
                                                    marginBottom: isMobile ? '12px' : '20px'
                                                } }), _jsx("div", { style: {
                                                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                                                    fontWeight: '900',
                                                    color: '#ffcc00',
                                                    marginBottom: isMobile ? '8px' : '16px'
                                                }, children: "10K+" }), _jsx("div", { style: { color: '#f5f5f7', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }, children: "\u00C9tudiants form\u00E9s" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("img", { src: "/icons/companies.png", alt: "Entreprises", style: {
                                                    width: '48px',
                                                    height: '48px',
                                                    marginBottom: '20px'
                                                } }), _jsx("div", { style: {
                                                    fontSize: '3.5rem',
                                                    fontWeight: '900',
                                                    color: '#61bfac',
                                                    marginBottom: '16px'
                                                }, children: "5K+" }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }, children: "Entreprises partenaires" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("img", { src: "/icons/coaches.png", alt: "Formateurs", style: {
                                                    width: '48px',
                                                    height: '48px',
                                                    marginBottom: '20px'
                                                } }), _jsx("div", { style: {
                                                    fontSize: '3.5rem',
                                                    fontWeight: '900',
                                                    color: '#ffcc00',
                                                    marginBottom: '16px'
                                                }, children: "50+" }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }, children: "Formateurs & Coaches" })] }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("img", { src: "/icons/countries.png", alt: "Pays", style: {
                                                    width: '48px',
                                                    height: '48px',
                                                    marginBottom: '20px'
                                                } }), _jsx("div", { style: {
                                                    fontSize: '3.5rem',
                                                    fontWeight: '900',
                                                    color: '#61bfac',
                                                    marginBottom: '16px'
                                                }, children: "8" }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }, children: "Pays" })] })] })] })] }), _jsxs("section", { style: {
                    padding: isMobile ? '80px 16px' : '120px 24px',
                    background: '#0a0a0a',
                    maxWidth: '1214px',
                    margin: '0 auto'
                }, children: [_jsxs("div", { style: {
                            textAlign: 'center',
                            marginBottom: isMobile ? '60px' : '80px'
                        }, children: [_jsx("h2", { style: {
                                    color: '#ffcc00',
                                    fontSize: isMobile ? '2rem' : '3rem',
                                    fontWeight: '700',
                                    marginBottom: '16px'
                                }, children: "1, 2, 3\u2026 jusqu'\u00E0 100 profils exceptionnels" }), _jsx("p", { style: {
                                    color: '#f5f5f7',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    maxWidth: '600px',
                                    margin: '0 auto',
                                    lineHeight: '1.6'
                                }, children: "D\u00E9couvrez nos talents form\u00E9s et valid\u00E9s par d'Edacy" })] }), loadingTalents ? (_jsx("div", { style: {
                            textAlign: 'center',
                            padding: '60px 0',
                            color: '#f5f5f7'
                        }, children: "Chargement des talents..." })) : featuredTalents.length === 0 ? (_jsx("div", { style: {
                            textAlign: 'center',
                            padding: '60px 0',
                            color: '#f5f5f7'
                        }, children: "Aucun talent mis en avant pour le moment." })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: '30px',
                                    marginBottom: '30px'
                                }, children: featuredTalents.slice(0, 2).map((talent, index) => (_jsxs("div", { style: {
                                        background: '#ffffff',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        display: 'flex',
                                        height: '200px'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                                    }, children: [_jsx("div", { style: {
                                                width: '200px',
                                                position: 'relative',
                                                flexShrink: 0,
                                                overflow: 'hidden'
                                            }, children: _jsx("img", { src: talent.photoUrl || '/images/talents/talent1.jpg', alt: talent.name, style: {
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }, onError: (e) => {
                                                    e.currentTarget.src = '/images/talents/talent1.jpg';
                                                } }) }), _jsxs("div", { style: {
                                                background: '#2c2c2c',
                                                padding: '24px',
                                                position: 'relative',
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }, children: [_jsxs("p", { style: {
                                                        color: '#ffffff',
                                                        fontSize: '1.1rem',
                                                        lineHeight: '1.6',
                                                        marginBottom: '16px',
                                                        fontStyle: 'italic'
                                                    }, children: ["\"", talent.quote, "\""] }), _jsxs("p", { style: {
                                                        color: '#cccccc',
                                                        fontSize: '0.9rem',
                                                        marginBottom: '0'
                                                    }, children: [talent.name, ", ", talent.role] })] })] }, talent.id))) }), featuredTalents.length > 2 && (_jsx("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '30px'
                                }, children: (() => {
                                    const talent = featuredTalents[2];
                                    return (_jsxs("div", { style: {
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            display: 'flex',
                                            height: '200px',
                                            width: isMobile ? '100%' : '600px'
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                                        }, children: [_jsx("div", { style: {
                                                    width: '200px',
                                                    position: 'relative',
                                                    flexShrink: 0,
                                                    overflow: 'hidden'
                                                }, children: _jsx("img", { src: talent.photoUrl || '/images/talents/talent3.jpg', alt: talent.name, style: {
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }, onError: (e) => {
                                                        e.currentTarget.src = '/images/talents/talent3.jpg';
                                                    } }) }), _jsxs("div", { style: {
                                                    background: '#2c2c2c',
                                                    padding: '24px',
                                                    position: 'relative',
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center'
                                                }, children: [_jsxs("p", { style: {
                                                            color: '#ffffff',
                                                            fontSize: '1.1rem',
                                                            lineHeight: '1.6',
                                                            marginBottom: '16px',
                                                            fontStyle: 'italic'
                                                        }, children: ["\"", talent.quote, "\""] }), _jsxs("p", { style: {
                                                            color: '#cccccc',
                                                            fontSize: '0.9rem',
                                                            marginBottom: '0'
                                                        }, children: [talent.name, ", ", talent.role] })] })] }));
                                })() }))] })), _jsxs("div", { style: {
                            textAlign: 'center',
                            marginTop: '40px'
                        }, children: [_jsx("button", { onClick: () => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }, style: {
                                    padding: '16px 32px',
                                    backgroundColor: '#ffcc00',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 24px rgba(255, 204, 0, 0.3)'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 204, 0, 0.4)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 204, 0, 0.3)';
                                }, children: "Voir plus de talents" }), _jsx("p", { style: {
                                    color: '#888',
                                    fontSize: '0.9rem',
                                    marginTop: '16px'
                                }, children: "Inscrivez-vous en tant que recruteur pour acc\u00E9der \u00E0 tous nos profils" })] })] }), _jsxs("section", { style: {
                    padding: isMobile ? '60px 16px' : '100px 24px',
                    background: '#transparent',
                    maxWidth: '1214px',
                    margin: '0 auto'
                }, children: [_jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                            gap: isMobile ? '40px' : '60px'
                        }, children: [_jsxs("div", { style: {
                                    background: '#1a1a1a',
                                    padding: isMobile ? '30px' : '50px',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.background = '#222';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#1a1a1a';
                                }, children: [_jsx("div", { style: {
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: '#ffcc00',
                                            borderRadius: '0 16px 0 100px',
                                            opacity: '0.1'
                                        } }), _jsxs("div", { style: { position: 'relative', zIndex: 2 }, children: [_jsx("div", { style: {
                                                    width: '70px',
                                                    height: '70px',
                                                    background: '#ffcc00',
                                                    borderRadius: '12px',
                                                    fontWeight: '800',
                                                    color: '#303030',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '32px',
                                                    fontSize: '22px'
                                                }, children: "Talent" }), _jsx("h3", { style: {
                                                    color: '#ffcc00',
                                                    marginTop: 0,
                                                    marginBottom: '24px',
                                                    fontSize: '2rem',
                                                    fontWeight: '700'
                                                }, children: "Un r\u00EAve qui prend vie" }), _jsx("p", { style: {
                                                    color: '#f5f5f7',
                                                    lineHeight: '1.6',
                                                    marginBottom: '32px',
                                                    fontSize: '1.1rem'
                                                }, children: "Le monde avance gr\u00E2ce \u00E0 celles et ceux qui osent r\u00EAver. Chez ProdTalent, nous croyons en ces r\u00EAveurs, en ces b\u00E2tisseurs d'avenir. Nous ne voyons pas seulement des comp\u00E9tences, mais des possibles. Et notre mission, c'est de transformer ces possibles en r\u00E9alit\u00E9s." }), _jsxs("ul", { style: {
                                                    color: '#f5f5f7',
                                                    paddingLeft: '20px',
                                                    marginBottom: '40px'
                                                }, children: [_jsx("li", { style: { marginBottom: '12px' }, children: "Dipl\u00F4m\u00E9s certifi\u00E9s Edacy, pr\u00EAts \u00E0 b\u00E2tir l'avenir." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Un profil unique, qui r\u00E9v\u00E8le votre potentiel." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Des recruteurs accessibles, sans d\u00E9tour." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Un coaching d\u00E9di\u00E9, \u00E0 chaque \u00E9tape." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Des opportunit\u00E9s rares, pour aller plus loin." })] }), _jsx("button", { onClick: () => { handleModeChange('signup'); setRole('talent'); setOpen(true); }, style: {
                                                    width: '100%',
                                                    padding: '18px 24px',
                                                    backgroundColor: '#ffcc00',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }, children: "Rejoindre comme Talent" })] })] }), _jsxs("div", { style: {
                                    background: '#1a1a1a',
                                    padding: '50px',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.background = '#222';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.background = '#1a1a1a';
                                }, children: [_jsx("div", { style: {
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '100px',
                                            height: '100px',
                                            background: '#61bfac',
                                            borderRadius: '0 16px 0 100px',
                                            opacity: '0.1'
                                        } }), _jsxs("div", { style: { position: 'relative', zIndex: 2 }, children: [_jsx("div", { style: {
                                                    width: '70px',
                                                    height: '70px',
                                                    background: '#61bfac',
                                                    borderRadius: '12px',
                                                    fontWeight: '800',
                                                    color: '#303030',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    paddingLeft: '5px',
                                                    marginBottom: '32px',
                                                    fontSize: '22px'
                                                }, children: "Recr uteur" }), _jsx("h3", { style: {
                                                    color: '#61bfac',
                                                    marginTop: 0,
                                                    marginBottom: '24px',
                                                    fontSize: '2rem',
                                                    fontWeight: '700'
                                                }, children: "Un recrutement qui a du sens" }), _jsx("p", { style: {
                                                    color: '#f5f5f7',
                                                    lineHeight: '1.6',
                                                    marginBottom: '32px',
                                                    fontSize: '1.1rem'
                                                }, children: "Trouver le bon talent, ce n'est pas cocher des cases. C'est d\u00E9couvrir une \u00E9nergie, une vision, une personne qui fera grandir votre \u00E9quipe. Avec ProdTalent, chaque profil est plus qu'un CV : c'est un parcours valid\u00E9, un potentiel r\u00E9v\u00E9l\u00E9. Nous simplifions vos recrutementspour vous permettre de vous concentrer sur l'essentiel : b\u00E2tir l'avenir avec les meilleurs.." }), _jsxs("ul", { style: {
                                                    color: '#f5f5f7',
                                                    paddingLeft: '20px',
                                                    marginBottom: '40px'
                                                }, children: [_jsx("li", { style: { marginBottom: '12px' }, children: "Des talents dipl\u00F4m\u00E9s Edacy, pr\u00EAts \u00E0 relever vos d\u00E9fis." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Une base de donn\u00E9es fiable et qualifi\u00E9e." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Un syst\u00E8me de matching IA, qui vous fait gagner du temps." }), _jsx("li", { style: { marginBottom: '12px' }, children: "Des profils d\u00E9taill\u00E9s et v\u00E9rifi\u00E9s, en toute confiance." }), _jsx("li", { children: "Un processus optimis\u00E9, pens\u00E9 pour l'efficacit\u00E9." })] }), _jsx("button", { onClick: () => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }, style: {
                                                    width: '100%',
                                                    padding: '18px 24px',
                                                    backgroundColor: '#61bfac',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }, children: "Rejoindre comme Recruteur" })] })] })] }), _jsxs("div", { style: {
                            background: '#1a1a1a',
                            padding: '60px',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            maxWidth: '600px',
                            margin: '80px auto 0',
                            textAlign: 'center'
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.background = '#222';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = '#1a1a1a';
                        }, children: [_jsx("div", { style: {
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '120px',
                                    height: '120px',
                                    background: '#ffcc00',
                                    borderRadius: '0 16px 0 120px',
                                    opacity: '0.1'
                                } }), _jsxs("div", { style: { position: 'relative', zIndex: 2 }, children: [_jsx("div", { style: {
                                            width: '70px',
                                            height: '70px',
                                            background: '#ffcc00',
                                            borderRadius: '12px',
                                            fontWeight: '800',
                                            color: '#303030',
                                            display: 'flex',
                                            alignItems: 'left',
                                            justifyContent: 'left',
                                            paddingLeft: '3px',
                                            marginBottom: '32px',
                                            fontSize: '22px'
                                        }, children: "Coach" }), _jsx("h3", { style: {
                                            color: '#ffcc00',
                                            marginTop: 0,
                                            marginBottom: '24px',
                                            fontSize: '2.2rem',
                                            fontWeight: '700',
                                            textAlign: 'left'
                                        }, children: "La Coach, votre alli\u00E9e pour aller plus loin" }), _jsx("p", { style: {
                                            color: '#f5f5f7',
                                            lineHeight: '1.6',
                                            marginBottom: '32px',
                                            fontSize: '1.2rem',
                                            textAlign: 'left'
                                        }, children: "Chez ProdTalent, la coach est bien plus qu\u2019une accompagnatrice. Elle est celle qui croit en vos capacit\u00E9s, m\u00EAme quand vous doutez. Celle qui \u00E9claire votre chemin, vous pousse \u00E0 sortir de votre zone de confort et transforme chaque \u00E9tape en une opportunit\u00E9 de grandir. " }), _jsx("div", { style: {
                                            background: 'rgba(255, 204, 0, 0.1)',
                                            padding: '32px',
                                            borderRadius: '12px',
                                            marginBottom: '40px'
                                        }, children: _jsx("p", { style: {
                                                color: '#ffcc00',
                                                fontWeight: '600',
                                                margin: '0',
                                                fontSize: '1.1rem',
                                            }, children: "Avec elle, vos comp\u00E9tences ne sont pas seulement renforc\u00E9es, elles prennent vie. Vous d\u00E9couvrez votre potentiel, vous gagnez en confiance, et vous avancez avec l\u2019assurance que vous n\u2019\u00EAtes jamais seule dans ce parcours. " }) })] })] })] }), open && (_jsx("div", { onClick: () => setOpen(false), style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                        backgroundColor: '#1a1a1a',
                        padding: 32,
                        borderRadius: 16,
                        maxWidth: 400,
                        width: '90%'
                    }, children: [_jsx("div", { style: {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 24
                            }, children: _jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: mode === 'login' ? 'Connexion' : 'Inscription' }) }), error && (_jsx("div", { style: {
                                padding: 12,
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                color: '#ff6b6b',
                                borderRadius: 8,
                                marginBottom: 16
                            }, children: error })), success && (_jsx("div", { style: {
                                padding: 12,
                                backgroundColor: 'rgba(97, 191, 172, 0.1)',
                                color: '#61bfac',
                                borderRadius: 8,
                                marginBottom: 16
                            }, children: success })), _jsxs("form", { onSubmit: onSubmit, children: [mode === 'signup' && (_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "R\u00F4le *" }), _jsx("select", { value: role, onChange: (e) => setRole(e.target.value), required: true, style: {
                                                width: '100%',
                                                padding: 12,
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: '14px'
                                            }, children: _jsx("option", { value: "recruteur", children: "Recruteur" }) }), _jsx("p", { style: {
                                                color: '#61bfac',
                                                fontSize: '12px',
                                                marginTop: '8px',
                                                marginBottom: 0
                                            }, children: "\uD83D\uDCA1 Les talents et coaches re\u00E7oivent un lien d'invitation personnalis\u00E9" })] })), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Email *" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: {
                                                width: '100%',
                                                padding: 12,
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: '14px'
                                            } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Mot de passe *" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: {
                                                width: '100%',
                                                padding: 12,
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: '14px'
                                            } })] }), _jsx("button", { type: "submit", disabled: busy, style: {
                                        width: '100%',
                                        padding: 14,
                                        backgroundColor: busy ? '#666' : '#ffcc00',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: busy ? 'not-allowed' : 'pointer'
                                    }, children: busy ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire') })] }), _jsx("div", { style: { marginTop: 16, textAlign: 'center' }, children: _jsx("button", { onClick: () => handleModeChange(mode === 'login' ? 'signup' : 'login'), style: {
                                    background: 'none',
                                    border: 'none',
                                    color: '#ffcc00',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }, children: mode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter' }) })] }) })), _jsx("style", { dangerouslySetInnerHTML: {
                    __html: `
          @keyframes pulse {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `
                } })] }));
}
