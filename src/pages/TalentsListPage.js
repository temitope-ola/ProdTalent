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
    const [isLoading, setIsLoading] = useState(true);
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
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '12px'
                                    }, children: "Retour" }), _jsxs("h1", { style: { margin: 0, color: '#ffcc00' }, children: ["Talents Disponibles (", talents.length, ")"] })] }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Se d\u00E9connecter" })] }), _jsx("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 20
                    }, children: talents.map(talent => (_jsxs("div", { style: {
                            backgroundColor: '#111',
                            borderRadius: 8,
                            padding: 20,
                            border: '1px solid #333'
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }, children: [_jsx(Avatar, { email: talent.email, src: talent.avatarUrl, size: "medium", editable: false }), _jsxs("div", { children: [_jsx("h3", { style: {
                                                    color: '#f5f5f7',
                                                    margin: '0 0 4px 0',
                                                    fontSize: '18px'
                                                }, children: talent.displayName || talent.email.split('@')[0] }), _jsx("p", { style: {
                                                    color: '#888',
                                                    margin: 0,
                                                    fontSize: '14px'
                                                }, children: talent.email })] })] }), talent.bio && (_jsx("div", { style: { marginBottom: 16 }, children: _jsx("p", { style: {
                                        color: '#f5f5f7',
                                        margin: 0,
                                        fontSize: '14px',
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }, children: talent.bio }) })), talent.skills && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("p", { style: {
                                            color: '#888',
                                            margin: '0 0 4px 0',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }, children: "Comp\u00E9tences" }), _jsx("p", { style: {
                                            color: '#f5f5f7',
                                            margin: 0,
                                            fontSize: '13px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }, children: talent.skills })] })), _jsx("div", { style: { display: 'flex', gap: 8 }, children: _jsx("button", { onClick: () => handleViewProfile(talent.id), style: {
                                        flex: 1,
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, children: "Voir le profil" }) })] }, talent.id))) }), talents.length === 0 && (_jsx("div", { style: {
                        textAlign: 'center',
                        padding: '40px',
                        color: '#888'
                    }, children: _jsx("p", { children: "Aucun talent disponible pour le moment." }) }))] }) }));
};
export default TalentsListPage;
