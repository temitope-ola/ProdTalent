import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';
export default function TalentRecommendationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (user && user.role === 'talent') {
            loadRecommendations();
        }
        else {
            navigate('/dashboard/talent');
        }
    }, [user, navigate]);
    const loadRecommendations = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const recommendationsRef = collection(db, 'recommendations');
            // Essayer d'abord avec l'ID utilisateur (sans orderBy pour éviter l'index)
            let q = query(recommendationsRef, where('talentId', '==', user.id));
            let snapshot = await getDocs(q);
            // Si aucune recommandation trouvée, essayer avec l'email
            if (snapshot.docs.length === 0 && user.email) {
                q = query(recommendationsRef, where('talentEmail', '==', user.email));
                snapshot = await getDocs(q);
            }
            const recommendationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
            // Tri côté client par date de création (plus récent en premier)
            recommendationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setRecommendations(recommendationsData);
        }
        catch (error) {
            console.error('Erreur lors du chargement des recommandations:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de charger les recommandations'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'acceptée': return '#61bfac';
            case 'refusée': return '#ff6b6b';
            case 'en_attente': return '#ffcc00';
            default: return '#f5f5f7';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'acceptée': return '✅ Acceptée par le recruteur';
            case 'refusée': return '❌ Refusée par le recruteur';
            case 'en_attente': return '⏳ En attente de réponse';
            default: return status;
        }
    };
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    if (!user || user.role !== 'talent') {
        return null;
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            padding: '24px'
        }, children: _jsxs("div", { style: {
                maxWidth: '1200px',
                margin: '0 auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 32,
                        paddingBottom: 16,
                        borderBottom: '1px solid #333'
                    }, children: [_jsxs("div", { children: [_jsx("h1", { style: { color: '#ffcc00', margin: 0 }, children: "Mes Recommandations" }), _jsx("p", { style: { color: '#f5f5f7', margin: '8px 0 0 0' }, children: "Recommandations envoy\u00E9es par vos coaches" })] }), _jsx("button", { onClick: () => navigate('/dashboard/talent'), style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#ffcc00',
                                border: '0.5px solid #ffcc00',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Retour au Dashboard" })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginBottom: 32
                    }, children: [_jsxs("div", { style: {
                                backgroundColor: '#111',
                                padding: 20,
                                borderRadius: 4,
                                border: 'transparent',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }, children: recommendations.length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "Total des recommandations" })] }), _jsxs("div", { style: {
                                backgroundColor: '#111',
                                padding: 20,
                                borderRadius: 4,
                                border: 'transparent',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }, children: recommendations.filter(r => r.status === 'en_attente').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "En attente" })] }), _jsxs("div", { style: {
                                backgroundColor: '#111',
                                padding: 20,
                                borderRadius: 4,
                                border: 'transparent',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#61bfac', fontSize: '24px', fontWeight: 'bold' }, children: recommendations.filter(r => r.status === 'acceptée').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "Accept\u00E9es" })] }), _jsxs("div", { style: {
                                backgroundColor: '#111',
                                padding: 20,
                                borderRadius: 4,
                                border: 'transparent',
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }, children: recommendations.filter(r => r.status === 'refusée').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "Refus\u00E9es" })] })] }), loading ? (_jsx("div", { style: { textAlign: 'center', color: '#f5f5f7', padding: 40 }, children: "Chargement des recommandations..." })) : recommendations.length === 0 ? (_jsxs("div", { style: {
                        backgroundColor: '#111',
                        padding: 40,
                        borderRadius: 4,
                        border: 'transparent',
                        textAlign: 'center'
                    }, children: [_jsx("div", { style: { color: '#f5f5f7', fontSize: '18px', marginBottom: 8 }, children: "Aucune recommandation re\u00E7ue" }), _jsx("div", { style: { color: '#666', fontSize: '14px' }, children: "Vos coaches vous enverront des recommandations ici" })] })) : (_jsx("div", { style: { display: 'grid', gap: 16 }, children: recommendations.map(recommendation => (_jsxs("div", { style: {
                            backgroundColor: '#111',
                            padding: 24,
                            borderRadius: 4,
                            border: 'transparent'
                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsxs("div", { style: { color: '#ffcc00', fontSize: '18px', fontWeight: 'bold', marginBottom: 8 }, children: ["Recommand\u00E9 \u00E0 ", recommendation.recruiterName] }), _jsxs("div", { style: { color: '#f5f5f7', fontSize: '14px', marginBottom: 4 }, children: ["Par ", _jsx("strong", { children: recommendation.coachName })] }), _jsx("div", { style: { color: '#666', fontSize: '12px' }, children: formatDate(recommendation.createdAt) })] }), _jsx("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: _jsx("span", { style: {
                                                padding: '6px 12px',
                                                backgroundColor: getStatusColor(recommendation.status),
                                                color: '#000',
                                                borderRadius: 4,
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }, children: getStatusText(recommendation.status) }) })] }), _jsxs("div", { style: { color: '#f5f5f7', fontSize: '14px', lineHeight: 1.6, marginBottom: 16 }, children: [_jsx("strong", { children: "Message du coach :" }), _jsx("br", {}), recommendation.message] }), _jsx("div", { style: {
                                    paddingTop: 16,
                                    borderTop: '1px solid #333'
                                }, children: _jsx("button", { onClick: () => navigate(`/profile/${recommendation.recruiterId}`), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '0.5px solid #ffcc00',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, children: "Voir le profil du recruteur" }) })] }, recommendation.id))) }))] }) }));
}
