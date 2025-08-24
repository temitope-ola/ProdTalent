import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';
const ProfileEditModal = ({ profile, isOpen, onClose, onSave }) => {
    const { showNotification } = useNotifications();
    const [formData, setFormData] = useState({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        skills: profile.skills || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        cvUrl: profile.cvUrl || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleCvUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Vérifier la taille du fichier (limite à 3MB pour permettre les CV avec photos)
            const maxSize = 3 * 1024 * 1024; // 3MB
            if (file.size > maxSize) {
                showNotification({
                    type: 'error',
                    title: 'Fichier trop volumineux',
                    message: 'Le fichier CV est trop volumineux. Veuillez choisir un fichier de moins de 3MB.'
                });
                e.target.value = '';
                return;
            }
            // Vérifier le type de fichier
            if (file.type !== 'application/pdf') {
                showNotification({
                    type: 'error',
                    title: 'Type de fichier invalide',
                    message: 'Veuillez sélectionner un fichier PDF.'
                });
                e.target.value = '';
                return;
            }
            setCvFile(file);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let cvUrl = formData.cvUrl;
            // Upload CV if a new file is selected
            if (cvFile) {
                try {
                    cvUrl = await FirestoreService.uploadCV(cvFile);
                }
                catch (error) {
                    console.error('Erreur lors de l\'upload du CV:', error);
                    showNotification({
                        type: 'error',
                        title: 'Erreur d\'upload',
                        message: error instanceof Error ? error.message : 'Erreur lors de l\'upload du CV'
                    });
                    setIsLoading(false);
                    return;
                }
            }
            const updatedData = {
                displayName: formData.displayName,
                bio: formData.bio,
                skills: formData.skills,
                linkedinUrl: formData.linkedinUrl,
                githubUrl: formData.githubUrl,
                cvUrl: cvUrl
            };
            await FirestoreService.updateProfile(profile.id, profile.role, updatedData);
            const updatedProfile = {
                ...profile,
                ...updatedData
            };
            onSave(updatedProfile);
            onClose();
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showNotification({
                type: 'error',
                title: 'Erreur de sauvegarde',
                message: 'Erreur lors de la sauvegarde du profil'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                backgroundColor: '#111',
                padding: '32px',
                borderRadius: '4px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "\u00C9diter le Profil" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }, children: "Fermer" })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "Nom d'affichage" }), _jsx("input", { type: "text", name: "displayName", value: formData.displayName, onChange: handleInputChange, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px'
                                    }, placeholder: "Votre nom d'affichage" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "Bio" }), _jsx("textarea", { name: "bio", value: formData.bio, onChange: handleInputChange, rows: 4, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }, placeholder: "Parlez-nous de vous..." })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "Comp\u00E9tences" }), _jsx("textarea", { name: "skills", value: formData.skills, onChange: handleInputChange, rows: 4, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }, placeholder: "Listez vos comp\u00E9tences techniques, langages de programmation, outils..." })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "LinkedIn" }), _jsx("input", { type: "url", name: "linkedinUrl", value: formData.linkedinUrl, onChange: handleInputChange, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px'
                                    }, placeholder: "https://linkedin.com/in/votre-profil" })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "GitHub" }), _jsx("input", { type: "url", name: "githubUrl", value: formData.githubUrl, onChange: handleInputChange, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px'
                                    }, placeholder: "https://github.com/votre-username" })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: '8px',
                                        fontWeight: 'bold'
                                    }, children: "CV (PDF - max 3MB)" }), _jsx("input", { type: "file", accept: ".pdf", onChange: handleCvUpload, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#222',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#f5f5f7',
                                        fontSize: '14px'
                                    } }), formData.cvUrl && (_jsxs("p", { style: { color: '#888', fontSize: '12px', marginTop: '4px' }, children: ["CV actuel: ", formData.cvUrl] }))] }), _jsxs("div", { style: {
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }, children: [_jsx("button", { type: "button", onClick: onClose, style: {
                                        padding: '12px 24px',
                                        backgroundColor: 'transparent',
                                        color: '#888',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, children: "Annuler" }), _jsx("button", { type: "submit", disabled: isLoading, style: {
                                        padding: '12px 24px',
                                        backgroundColor: '#ffcc00',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: isLoading ? 0.6 : 1
                                    }, children: isLoading ? 'Sauvegarde...' : 'Sauvegarder' })] })] })] }) }));
};
export default ProfileEditModal;
