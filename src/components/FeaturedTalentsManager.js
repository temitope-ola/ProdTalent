import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FeaturedTalentsService } from '../services/featuredTalentsService';
const FeaturedTalentsManager = () => {
    const [talents, setTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTalent, setNewTalent] = useState({
        name: '',
        role: '',
        quote: '',
        photoUrl: '',
        order: 1
    });
    const [editingTalent, setEditingTalent] = useState(null);
    const [message, setMessage] = useState('');
    useEffect(() => {
        loadTalents();
    }, []);
    const loadTalents = async () => {
        try {
            const fetchedTalents = await FeaturedTalentsService.getFeaturedTalents();
            setTalents(fetchedTalents);
        }
        catch (error) {
            console.error('Erreur lors du chargement des talents:', error);
            setMessage('Erreur lors du chargement des talents');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddTalent = async () => {
        if (!newTalent.name || !newTalent.role || !newTalent.quote) {
            setMessage('Veuillez remplir tous les champs obligatoires');
            return;
        }
        try {
            await FeaturedTalentsService.addFeaturedTalent(newTalent);
            setNewTalent({ name: '', role: '', quote: '', photoUrl: '', order: 1 });
            setMessage('Talent ajouté avec succès !');
            loadTalents();
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout du talent:', error);
            setMessage('Erreur lors de l\'ajout du talent');
        }
    };
    const handleUpdateTalent = async () => {
        if (!editingTalent || !editingTalent.id)
            return;
        try {
            await FeaturedTalentsService.updateFeaturedTalent(editingTalent.id, editingTalent);
            setEditingTalent(null);
            setMessage('Talent mis à jour avec succès !');
            loadTalents();
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du talent:', error);
            setMessage('Erreur lors de la mise à jour du talent');
        }
    };
    const handleDeleteTalent = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce talent ?')) {
            try {
                await FeaturedTalentsService.deleteFeaturedTalent(id);
                setMessage('Talent supprimé avec succès !');
                loadTalents();
            }
            catch (error) {
                console.error('Erreur lors de la suppression du talent:', error);
                setMessage('Erreur lors de la suppression du talent');
            }
        }
    };
    const handlePhotoUpload = async (file, setPhotoUrl) => {
        try {
            // Pour l'instant, utilisons une approche simple
            // Copions le fichier dans le dossier public/images/talents/
            const fileName = `talent_${Date.now()}_${file.name}`;
            const localPath = `/images/talents/${fileName}`;
            // Afficher un message informatif
            setMessage(`Photo sélectionnée: ${file.name}. Utilisez le chemin: ${localPath}`);
            // Pour l'instant, utilisons un chemin local
            setPhotoUrl(localPath);
        }
        catch (error) {
            console.error('Erreur lors de l\'upload de la photo:', error);
            setMessage('Erreur lors de l\'upload de la photo. Utilisez une URL externe.');
        }
    };
    const getPhotoPreview = (photoUrl) => {
        if (!photoUrl)
            return '/images/talents/talent1.jpg';
        // Si c'est une URL externe, l'utiliser directement
        if (photoUrl.startsWith('http')) {
            return photoUrl;
        }
        // Si c'est un chemin local, l'utiliser
        if (photoUrl.startsWith('/')) {
            return photoUrl;
        }
        // Fallback
        return '/images/talents/talent1.jpg';
    };
    const handleImageError = (e) => {
        console.log('Erreur de chargement image:', e.currentTarget.src);
        // Masquer l'image et afficher un placeholder
        e.currentTarget.style.display = 'none';
        const nextElement = e.currentTarget.nextElementSibling;
        if (nextElement) {
            nextElement.style.display = 'flex';
        }
    };
    if (loading) {
        return (_jsx("div", { style: {
                padding: '40px',
                textAlign: 'center',
                color: '#f5f5f7',
                background: '#0a0a0a',
                minHeight: '100vh'
            }, children: "Chargement..." }));
    }
    return (_jsx("div", { style: {
            padding: '40px',
            background: '#0a0a0a',
            minHeight: '100vh',
            color: '#f5f5f7'
        }, children: _jsxs("div", { style: { maxWidth: '1200px', margin: '0 auto' }, children: [_jsx("h1", { style: {
                        color: '#ffcc00',
                        marginBottom: '40px',
                        fontSize: '2.5rem'
                    }, children: "Gestion des Talents Mis en Avant" }), message && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: message.includes('succès') ? 'rgba(97, 191, 172, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        color: message.includes('succès') ? '#61bfac' : '#ff6b6b',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }, children: message })), _jsxs("div", { style: {
                        background: '#1a1a1a',
                        padding: '30px',
                        borderRadius: '12px',
                        marginBottom: '40px'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', marginBottom: '20px' }, children: "Ajouter un nouveau talent" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Nom *" }), _jsx("input", { type: "text", value: newTalent.name, onChange: (e) => setNewTalent({ ...newTalent, name: e.target.value }), style: {
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: '8px'
                                            } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "R\u00F4le *" }), _jsx("input", { type: "text", value: newTalent.role, onChange: (e) => setNewTalent({ ...newTalent, role: e.target.value }), style: {
                                                width: '100%',
                                                padding: '12px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: '8px'
                                            } })] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Citation/Quote *" }), _jsx("textarea", { value: newTalent.quote, onChange: (e) => setNewTalent({ ...newTalent, quote: e.target.value }), rows: 3, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px',
                                        resize: 'vertical'
                                    } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Photo du talent" }), _jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handlePhotoUpload(file, (url) => {
                                                        setNewTalent({ ...newTalent, photoUrl: url });
                                                    });
                                                }
                                            }, style: { display: 'none' }, id: "photo-upload" }), _jsx("label", { htmlFor: "photo-upload", style: {
                                                display: 'inline-block',
                                                padding: '10px 20px',
                                                backgroundColor: '#61bfac',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                marginRight: '10px'
                                            }, children: "\uD83D\uDCC1 Uploader une photo" }), _jsx("span", { style: { fontSize: '12px', color: '#888' }, children: "ou utilisez une URL ci-dessous" })] }), _jsx("input", { type: "url", value: newTalent.photoUrl, onChange: (e) => setNewTalent({ ...newTalent, photoUrl: e.target.value }), placeholder: "https://example.com/photo.jpg ou /images/talents/talent1.jpg", style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px'
                                    } }), _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("p", { style: { fontSize: '12px', color: '#888', marginBottom: '8px' }, children: "Photos disponibles :" }), _jsx("div", { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }, children: ['talent1.jpg', 'talent2.jpg', 'talent3.jpg'].map((photo) => (_jsx("button", { onClick: () => setNewTalent({ ...newTalent, photoUrl: `/images/talents/${photo}` }), style: {
                                                    padding: '8px 12px',
                                                    backgroundColor: newTalent.photoUrl === `/images/talents/${photo}` ? '#ffcc00' : '#333',
                                                    color: newTalent.photoUrl === `/images/talents/${photo}` ? '#000' : '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }, children: photo }, photo))) }), _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("p", { style: { fontSize: '12px', color: '#888', marginBottom: '8px' }, children: "Photos de test (URLs externes) :" }), _jsxs("div", { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => setNewTalent({ ...newTalent, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }), style: {
                                                                padding: '8px 12px',
                                                                backgroundColor: newTalent.photoUrl.includes('unsplash.com') ? '#ffcc00' : '#333',
                                                                color: newTalent.photoUrl.includes('unsplash.com') ? '#000' : '#f5f5f7',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }, children: "Photo Test 1" }), _jsx("button", { onClick: () => setNewTalent({ ...newTalent, photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop' }), style: {
                                                                padding: '8px 12px',
                                                                backgroundColor: newTalent.photoUrl.includes('unsplash.com') ? '#ffcc00' : '#333',
                                                                color: newTalent.photoUrl.includes('unsplash.com') ? '#000' : '#f5f5f7',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }, children: "Photo Test 2" })] })] })] }), _jsx("p", { style: { fontSize: '12px', color: '#888', marginTop: '4px' }, children: "Utilisez une URL externe, un chemin local, ou uploader un fichier" }), newTalent.photoUrl && (_jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("p", { style: { fontSize: '12px', color: '#888', marginBottom: '5px' }, children: "Aper\u00E7u :" }), _jsx("div", { style: {
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: '#333',
                                                border: '2px solid #ffcc00'
                                            }, children: _jsx("img", { src: getPhotoPreview(newTalent.photoUrl), alt: "Aper\u00E7u", style: {
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }, onError: handleImageError }) })] }))] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Ordre d'affichage" }), _jsx("input", { type: "number", value: newTalent.order, onChange: (e) => setNewTalent({ ...newTalent, order: parseInt(e.target.value) || 1 }), min: "1", style: {
                                        width: '100px',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px'
                                    } })] }), _jsx("button", { onClick: handleAddTalent, style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }, children: "Ajouter le talent" })] }), _jsxs("div", { children: [_jsx("h2", { style: { color: '#ffcc00', marginBottom: '20px' }, children: "Talents existants" }), talents.length === 0 ? (_jsx("p", { style: { color: '#888', textAlign: 'center', padding: '40px' }, children: "Aucun talent mis en avant pour le moment." })) : (_jsx("div", { style: { display: 'grid', gap: '20px' }, children: talents.map((talent) => (_jsxs("div", { style: {
                                    background: '#1a1a1a',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'flex-start'
                                }, children: [_jsx("div", { style: {
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            background: '#333'
                                        }, children: _jsx("img", { src: getPhotoPreview(talent.photoUrl), alt: talent.name, style: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }, onError: handleImageError }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 8px 0' }, children: talent.name }), _jsx("p", { style: { color: '#61bfac', margin: '0 0 8px 0' }, children: talent.role }), _jsxs("p", { style: { color: '#f5f5f7', margin: '0 0 8px 0', fontStyle: 'italic' }, children: ["\"", talent.quote, "\""] }), _jsxs("p", { style: { color: '#888', margin: 0, fontSize: '14px' }, children: ["Ordre: ", talent.order] }), talent.photoUrl && (_jsxs("p", { style: { color: '#888', margin: '4px 0 0 0', fontSize: '12px' }, children: ["Photo: ", talent.photoUrl] }))] }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: () => setEditingTalent(talent), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: '#ffcc00',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }, children: "Modifier" }), _jsx("button", { onClick: () => talent.id && handleDeleteTalent(talent.id), style: {
                                                    padding: '8px 16px',
                                                    backgroundColor: '#ff6b6b',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }, children: "Supprimer" })] })] }, talent.id))) }))] }), editingTalent && (_jsx("div", { style: {
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
                            background: '#1a1a1a',
                            padding: '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }, children: [_jsx("h2", { style: { color: '#ffcc00', marginBottom: '20px' }, children: "Modifier le talent" }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Nom" }), _jsx("input", { type: "text", value: editingTalent.name, onChange: (e) => setEditingTalent({ ...editingTalent, name: e.target.value }), style: {
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '8px'
                                        } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "R\u00F4le" }), _jsx("input", { type: "text", value: editingTalent.role, onChange: (e) => setEditingTalent({ ...editingTalent, role: e.target.value }), style: {
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '8px'
                                        } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Citation" }), _jsx("textarea", { value: editingTalent.quote, onChange: (e) => setEditingTalent({ ...editingTalent, quote: e.target.value }), rows: 3, style: {
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '8px',
                                            resize: 'vertical'
                                        } })] }), _jsxs("div", { style: { marginBottom: '15px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Photo du talent" }), _jsxs("div", { style: { marginBottom: '10px' }, children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handlePhotoUpload(file, (url) => {
                                                            setEditingTalent({ ...editingTalent, photoUrl: url });
                                                        });
                                                    }
                                                }, style: { display: 'none' }, id: "photo-upload-edit" }), _jsx("label", { htmlFor: "photo-upload-edit", style: {
                                                    display: 'inline-block',
                                                    padding: '10px 20px',
                                                    backgroundColor: '#61bfac',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    marginRight: '10px'
                                                }, children: "\uD83D\uDCC1 Uploader une photo" }), _jsx("span", { style: { fontSize: '12px', color: '#888' }, children: "ou utilisez une URL ci-dessous" })] }), _jsx("input", { type: "url", value: editingTalent.photoUrl, onChange: (e) => setEditingTalent({ ...editingTalent, photoUrl: e.target.value }), placeholder: "https://example.com/photo.jpg ou /images/talents/talent1.jpg", style: {
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '8px'
                                        } }), _jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("p", { style: { fontSize: '12px', color: '#888', marginBottom: '8px' }, children: "Photos disponibles :" }), _jsx("div", { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' }, children: ['talent1.jpg', 'talent2.jpg', 'talent3.jpg'].map((photo) => (_jsx("button", { onClick: () => setEditingTalent({ ...editingTalent, photoUrl: `/images/talents/${photo}` }), style: {
                                                        padding: '8px 12px',
                                                        backgroundColor: editingTalent.photoUrl === `/images/talents/${photo}` ? '#ffcc00' : '#333',
                                                        color: editingTalent.photoUrl === `/images/talents/${photo}` ? '#000' : '#f5f5f7',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }, children: photo }, photo))) })] }), editingTalent.photoUrl && (_jsxs("div", { style: { marginTop: '10px' }, children: [_jsx("p", { style: { fontSize: '12px', color: '#888', marginBottom: '5px' }, children: "Aper\u00E7u :" }), _jsx("div", { style: {
                                                    width: '100px',
                                                    height: '100px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    background: '#333',
                                                    border: '2px solid #ffcc00'
                                                }, children: _jsx("img", { src: getPhotoPreview(editingTalent.photoUrl), alt: "Aper\u00E7u", style: {
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }, onError: handleImageError }) })] }))] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Ordre" }), _jsx("input", { type: "number", value: editingTalent.order, onChange: (e) => setEditingTalent({ ...editingTalent, order: parseInt(e.target.value) || 1 }), min: "1", style: {
                                            width: '100px',
                                            padding: '12px',
                                            backgroundColor: '#333',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: '8px'
                                        } })] }), _jsxs("div", { style: { display: 'flex', gap: '10px' }, children: [_jsx("button", { onClick: handleUpdateTalent, style: {
                                            padding: '12px 24px',
                                            backgroundColor: '#ffcc00',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }, children: "Sauvegarder" }), _jsx("button", { onClick: () => setEditingTalent(null), style: {
                                            padding: '12px 24px',
                                            backgroundColor: '#666',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer'
                                        }, children: "Annuler" })] })] }) }))] }) }));
};
export default FeaturedTalentsManager;
