import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';
import emailNotificationService from '../services/emailNotificationService';
export default function CoachRecommendationManager({ isOpen, onClose }) {
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [talents, setTalents] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTalent, setSelectedTalent] = useState('');
    const [selectedRecruiter, setSelectedRecruiter] = useState('');
    const [message, setMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user]);
    const loadData = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Charger les talents
            const talentsData = await FirestoreService.getUsersByRole('talent');
            setTalents(talentsData);
            // Charger les recruteurs
            const recruitersData = await FirestoreService.getUsersByRole('recruteur');
            setRecruiters(recruitersData);
            // Charger les recommandations existantes du coach
            await loadRecommendations();
        }
        catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de charger les données'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const loadRecommendations = async () => {
        if (!user)
            return;
        try {
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const recommendationsRef = collection(db, 'recommendations');
            const q = query(recommendationsRef, where('coachId', '==', user.id), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const recommendationsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
            setRecommendations(recommendationsData);
        }
        catch (error) {
            console.error('Erreur lors du chargement des recommandations:', error);
        }
    };
    const handleCreateRecommendation = async () => {
        if (!user || !selectedTalent || !selectedRecruiter || !message.trim()) {
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Veuillez remplir tous les champs'
            });
            return;
        }
        setIsCreating(true);
        try {
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            // Récupérations
            const talent = talents.find(t => t.id === selectedTalent);
            const recruiter = recruiters.find(r => r.id === selectedRecruiter);
            if (!user?.id)
                throw new Error("Coach non authentifié");
            if (!talent || !recruiter)
                throw new Error("Talent ou recruteur non trouvé");
            if (!message?.trim())
                throw new Error("Le message de recommandation est requis");
            // Petites fonctions utilitaires pour des noms propres
            const shortName = (displayName, email, fallback = "Inconnu") => (displayName && displayName.trim()) || (email && email.split("@")[0]) || fallback;
            const coachName = shortName(user.displayName, user.email, "Coach");
            const talentName = shortName(talent.displayName, talent.email, "Talent");
            const recrName = shortName(recruiter.displayName, recruiter.email, "Recruteur");
            // 1) Créer la recommandation
            const recommendationData = {
                coachId: user.id,
                coachName,
                coachEmail: user.email || "",
                talentId: selectedTalent,
                talentName,
                talentEmail: talent.email || "",
                recruiterId: selectedRecruiter,
                recruiterName: recrName,
                recruiterEmail: recruiter.email || "",
                message: message.trim(),
                status: "en_attente",
                createdAt: serverTimestamp()
            };
            const recRef = await addDoc(collection(db, "recommendations"), recommendationData);
            // 2) Créer la notification (utilise l'ID renvoyé par Firestore)
            const notificationData = {
                userId: selectedRecruiter, // le recruteur reçoit la notif
                type: "recommendation",
                title: "Nouvelle recommandation reçue",
                message: `${coachName} vous a recommandé ${talentName}`,
                data: {
                    recommendationId: recRef.id, // <<< ici l'ID correct
                    coachId: user.id,
                    talentId: selectedTalent
                },
                read: false,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "notifications"), notificationData);
            // 3) Envoyer les notifications par email
            try {
                const emailResults = await emailNotificationService.sendNewRecommendation({
                    talentEmail: talent.email || '',
                    talentName,
                    recruiterEmail: recruiter.email || '',
                    recruiterName: recrName,
                    coachName,
                    message: message.trim()
                });
                console.log('📧 Résultats envoi emails:', emailResults);
                // Vérifier si au moins un email a été envoyé avec succès
                const successCount = emailResults.filter(r => r.success).length;
                if (successCount > 0) {
                    console.log(`✅ ${successCount} notification(s) email envoyée(s) avec succès`);
                }
            }
            catch (emailError) {
                console.warn('⚠️ Erreur lors de l\'envoi des emails (non bloquant):', emailError);
            }
            showNotification({
                type: "success",
                title: "Recommandation créée",
                message: "Votre recommandation a été envoyée avec succès"
            });
            // Réinitialiser le formulaire
            setSelectedTalent("");
            setSelectedRecruiter("");
            setMessage("");
            // Recharger les recommandations
            await loadRecommendations();
            return { success: true };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("❌ Erreur création recommandation/notification:", message);
            showNotification({
                type: "error",
                title: "Échec de l'envoi",
                message: message || "Une erreur est survenue."
            });
            return { success: false, error: message };
        }
        finally {
            setIsCreating(false);
        }
    };
    const handleDeleteRecommendation = async (recommendationId) => {
        if (!recommendationId)
            return;
        try {
            const { doc, deleteDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            await deleteDoc(doc(db, 'recommendations', recommendationId));
            await loadRecommendations();
            showNotification({
                type: 'success',
                title: 'Succès',
                message: 'Recommandation supprimée'
            });
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de supprimer la recommandation'
            });
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
    const getStatusColor = (status) => {
        switch (status) {
            case 'refusée': return '#ff6b6b';
            case 'en_attente': return '#ffcc00';
            default: return '#61bfac';
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { onClick: onClose, style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 999
                } }), _jsxs("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "reco-title", style: {
                    position: 'fixed',
                    inset: 0,
                    margin: 'auto',
                    backgroundColor: '#111',
                    borderRadius: 12,
                    padding: 24,
                    width: '90%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 12,
                            borderBottom: '1px solid #222'
                        }, children: [_jsx("h2", { id: "reco-title", style: { color: '#ffcc00', margin: 0 }, children: "Gestion des Recommandations" }), _jsx("button", { onClick: onClose, "aria-label": "Fermer", style: {
                                    background: 'transparent',
                                    color: '#f5f5f7',
                                    border: '1px solid #333',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: 14
                                }, children: "Fermer" })] }), loading ? (_jsx("div", { style: { textAlign: 'center', padding: 40, color: '#f5f5f7' }, children: "Chargement..." })) : (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: 16 }, children: "Cr\u00E9er une recommandation" }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Talent \u00E0 recommander" }), _jsxs("select", { value: selectedTalent, onChange: (e) => setSelectedTalent(e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: '14px'
                                                }, children: [_jsx("option", { value: "", children: talents.length === 0 ? 'Aucun talent disponible' : 'Sélectionner un talent' }), talents.map(talent => (_jsxs("option", { value: talent.id, children: [talent.displayName || talent.email?.split('@')[0] || 'Talent', " (", talent.email, ")"] }, talent.id)))] }), talents.length === 0 && (_jsx("div", { style: { color: '#ffcc00', fontSize: '12px', marginTop: 4 }, children: "Aucun talent enregistr\u00E9 dans la base de donn\u00E9es" }))] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Recruteur destinataire" }), _jsxs("select", { value: selectedRecruiter, onChange: (e) => setSelectedRecruiter(e.target.value), style: {
                                                    width: '100%',
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: '14px'
                                                }, children: [_jsx("option", { value: "", children: recruiters.length === 0 ? 'Aucun recruteur disponible' : 'Sélectionner un recruteur' }), recruiters.map(recruiter => (_jsxs("option", { value: recruiter.id, children: [recruiter.displayName || recruiter.email?.split('@')[0] || 'Recruteur', " (", recruiter.email, ")"] }, recruiter.id)))] }), recruiters.length === 0 && (_jsx("div", { style: { color: '#ffcc00', fontSize: '12px', marginTop: 4 }, children: "Aucun recruteur enregistr\u00E9 dans la base de donn\u00E9es" }))] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Message de recommandation" }), _jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "D\u00E9crivez pourquoi vous recommandez ce talent...", style: {
                                                    width: '100%',
                                                    minHeight: 120,
                                                    padding: 12,
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    fontSize: '14px',
                                                    resize: 'vertical'
                                                } })] }), _jsx("button", { onClick: handleCreateRecommendation, disabled: isCreating || !selectedTalent || !selectedRecruiter || !message.trim() || talents.length === 0 || recruiters.length === 0, style: {
                                            width: '100%',
                                            padding: 12,
                                            backgroundColor: isCreating || talents.length === 0 || recruiters.length === 0 ? '#666' : '#ffcc00',
                                            color: isCreating || talents.length === 0 || recruiters.length === 0 ? '#999' : '#000',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: isCreating || talents.length === 0 || recruiters.length === 0 ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }, children: isCreating ? 'Création...' :
                                            talents.length === 0 || recruiters.length === 0 ? 'Aucun utilisateur disponible' :
                                                'Créer la recommandation' })] }), _jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: 16 }, children: "Mes recommandations" }), recommendations.length === 0 ? (_jsx("div", { style: { color: '#f5f5f7', textAlign: 'center', padding: 20 }, children: "Aucune recommandation pour le moment" })) : (_jsx("div", { style: { maxHeight: '400px', overflow: 'auto' }, children: recommendations.map(recommendation => (_jsxs("div", { style: {
                                                backgroundColor: '#333',
                                                padding: 16,
                                                borderRadius: 4,
                                                marginBottom: 12,
                                                border: 'none'
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }, children: [_jsxs("div", { children: [_jsxs("div", { style: { color: '#ffcc00', fontWeight: 'bold', marginBottom: 4 }, children: [recommendation.talentName, " \u2192 ", recommendation.recruiterName] }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '12px' }, children: formatDate(recommendation.createdAt) })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("span", { style: {
                                                                        padding: '4px 8px',
                                                                        backgroundColor: getStatusColor(recommendation.status),
                                                                        color: '#000',
                                                                        borderRadius: 4,
                                                                        fontSize: '12px',
                                                                        fontWeight: 'bold'
                                                                    }, children: recommendation.status }), recommendation.status === 'en_attente' && (_jsx("button", { onClick: () => recommendation.id && handleDeleteRecommendation(recommendation.id), style: {
                                                                        backgroundColor: 'transparent',
                                                                        color: '#ff6b6b',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px'
                                                                    }, children: "Supprimer" }))] })] }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px', lineHeight: 1.4 }, children: recommendation.message })] }, recommendation.id))) }))] })] }))] })] }));
}
