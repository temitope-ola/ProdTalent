import React, { useState, useEffect } from 'react';
import { FeaturedTalentsService, FeaturedTalent } from '../services/featuredTalentsService';
import { FirestoreService } from '../services/firestoreService';

const FeaturedTalentsManager: React.FC = () => {
  const [talents, setTalents] = useState<FeaturedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTalent, setNewTalent] = useState({
    name: '',
    role: '',
    quote: '',
    photoUrl: '',
    order: 1
  });
  const [editingTalent, setEditingTalent] = useState<FeaturedTalent | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTalents();
  }, []);

  const loadTalents = async () => {
    try {
      const fetchedTalents = await FeaturedTalentsService.getFeaturedTalents();
      setTalents(fetchedTalents);
    } catch (error) {
      console.error('Erreur lors du chargement des talents:', error);
      setMessage('Erreur lors du chargement des talents');
    } finally {
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
    } catch (error) {
      console.error('Erreur lors de l\'ajout du talent:', error);
      setMessage('Erreur lors de l\'ajout du talent');
    }
  };

  const handleUpdateTalent = async () => {
    if (!editingTalent || !editingTalent.id) return;

    try {
      await FeaturedTalentsService.updateFeaturedTalent(editingTalent.id, editingTalent);
      setEditingTalent(null);
      setMessage('Talent mis à jour avec succès !');
      loadTalents();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du talent:', error);
      setMessage('Erreur lors de la mise à jour du talent');
    }
  };

  const handleDeleteTalent = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce talent ?')) {
      try {
        await FeaturedTalentsService.deleteFeaturedTalent(id);
        setMessage('Talent supprimé avec succès !');
        loadTalents();
      } catch (error) {
        console.error('Erreur lors de la suppression du talent:', error);
        setMessage('Erreur lors de la suppression du talent');
      }
    }
  };

  const handlePhotoUpload = async (file: File, setPhotoUrl: (url: string) => void) => {
    try {
      // Pour l'instant, utilisons une approche simple
      // Copions le fichier dans le dossier public/images/talents/
      const fileName = `talent_${Date.now()}_${file.name}`;
      const localPath = `/images/talents/${fileName}`;
      
      // Afficher un message informatif
      setMessage(`Photo sélectionnée: ${file.name}. Utilisez le chemin: ${localPath}`);
      
      // Pour l'instant, utilisons un chemin local
      setPhotoUrl(localPath);
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      setMessage('Erreur lors de l\'upload de la photo. Utilisez une URL externe.');
    }
  };

  const getPhotoPreview = (photoUrl: string) => {
    if (!photoUrl) return '/images/talents/talent1.jpg';
    
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

      const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.log('Erreur de chargement image:', e.currentTarget.src);
      // Masquer l'image et afficher un placeholder
      e.currentTarget.style.display = 'none';
      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#f5f5f7',
        background: '#0a0a0a',
        minHeight: '100vh'
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0a0a0a',
      minHeight: '100vh',
      color: '#f5f5f7'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: '#ffcc00', 
          marginBottom: '40px',
          fontSize: '2.5rem'
        }}>
          Gestion des Talents Mis en Avant
        </h1>

        {message && (
          <div style={{
            padding: '12px',
            backgroundColor: message.includes('succès') ? 'rgba(97, 191, 172, 0.1)' : 'rgba(255, 107, 107, 0.1)',
            color: message.includes('succès') ? '#61bfac' : '#ff6b6b',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div style={{
          background: '#1a1a1a',
          padding: '30px',
          borderRadius: '4px',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '20px' }}>Ajouter un nouveau talent</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                Nom *
              </label>
              <input
                type="text"
                value={newTalent.name}
                onChange={(e) => setNewTalent({ ...newTalent, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                Rôle *
              </label>
              <input
                type="text"
                value={newTalent.role}
                onChange={(e) => setNewTalent({ ...newTalent, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Citation/Quote *
            </label>
            <textarea
              value={newTalent.quote}
              onChange={(e) => setNewTalent({ ...newTalent, quote: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Photo du talent
            </label>
            
            {/* Bouton d'upload de fichier */}
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePhotoUpload(file, (url) => {
                      setNewTalent({ ...newTalent, photoUrl: url });
                    });
                  }
                }}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#61bfac',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
              >
                📁 Uploader une photo
              </label>
              <span style={{ fontSize: '12px', color: '#888' }}>
                ou utilisez une URL ci-dessous
              </span>
            </div>

            {/* URL de la photo */}
            <input
              type="url"
              value={newTalent.photoUrl}
              onChange={(e) => setNewTalent({ ...newTalent, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg ou /images/talents/talent1.jpg"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px'
              }}
            />
            
            {/* Options de photos prédéfinies */}
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Photos disponibles :</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['talent1.jpg', 'talent2.jpg', 'talent3.jpg'].map((photo) => (
                  <button
                    key={photo}
                    onClick={() => setNewTalent({ ...newTalent, photoUrl: `/images/talents/${photo}` })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: newTalent.photoUrl === `/images/talents/${photo}` ? '#ffcc00' : '#333',
                      color: newTalent.photoUrl === `/images/talents/${photo}` ? '#000' : '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {photo}
                  </button>
                ))}
              </div>
              
              {/* URLs externes de test */}
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Photos de test (URLs externes) :</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setNewTalent({ ...newTalent, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: newTalent.photoUrl.includes('unsplash.com') ? '#ffcc00' : '#333',
                      color: newTalent.photoUrl.includes('unsplash.com') ? '#000' : '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Photo Test 1
                  </button>
                  <button
                    onClick={() => setNewTalent({ ...newTalent, photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop' })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: newTalent.photoUrl.includes('unsplash.com') ? '#ffcc00' : '#333',
                      color: newTalent.photoUrl.includes('unsplash.com') ? '#000' : '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Photo Test 2
                  </button>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              Utilisez une URL externe, un chemin local, ou uploader un fichier
            </p>

            {/* Aperçu de la photo */}
            {newTalent.photoUrl && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Aperçu :</p>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#333',
                  border: '2px solid #ffcc00'
                }}>
                  <img
                    src={getPhotoPreview(newTalent.photoUrl)}
                    alt="Aperçu"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={handleImageError}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={newTalent.order}
              onChange={(e) => setNewTalent({ ...newTalent, order: parseInt(e.target.value) || 1 })}
              min="1"
              style={{
                width: '100px',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px'
              }}
            />
          </div>

          <button
            onClick={handleAddTalent}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ajouter le talent
          </button>
        </div>

        {/* Liste des talents existants */}
        <div>
          <h2 style={{ color: '#ffcc00', marginBottom: '20px' }}>Talents existants</h2>
          
          {talents.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
              Aucun talent mis en avant pour le moment.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {talents.map((talent) => (
                <div key={talent.id} style={{
                  background: '#1a1a1a',
                  padding: '20px',
                  borderRadius: '4px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}>
                  {/* Aperçu de la photo */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#333'
                  }}>
                    <img
                      src={getPhotoPreview(talent.photoUrl)}
                      alt={talent.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={handleImageError}
                    />
                  </div>

                  {/* Informations du talent */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>{talent.name}</h3>
                    <p style={{ color: '#61bfac', margin: '0 0 8px 0' }}>{talent.role}</p>
                    <p style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontStyle: 'italic' }}>
                      "{talent.quote}"
                    </p>
                    <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                      Ordre: {talent.order}
                    </p>
                    {talent.photoUrl && (
                      <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '12px' }}>
                        Photo: {talent.photoUrl}
                      </p>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setEditingTalent(talent)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffcc00',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => talent.id && handleDeleteTalent(talent.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff6b6b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de modification */}
        {editingTalent && (
          <div style={{
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
          }}>
            <div style={{
              background: '#1a1a1a',
              padding: '30px',
              borderRadius: '4px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ color: '#ffcc00', marginBottom: '20px' }}>Modifier le talent</h2>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                  Nom
                </label>
                <input
                  type="text"
                  value={editingTalent.name}
                  onChange={(e) => setEditingTalent({ ...editingTalent, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                  Rôle
                </label>
                <input
                  type="text"
                  value={editingTalent.role}
                  onChange={(e) => setEditingTalent({ ...editingTalent, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                  Citation
                </label>
                <textarea
                  value={editingTalent.quote}
                  onChange={(e) => setEditingTalent({ ...editingTalent, quote: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                  Photo du talent
                </label>
                
                {/* Bouton d'upload de fichier */}
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handlePhotoUpload(file, (url) => {
                          setEditingTalent({ ...editingTalent, photoUrl: url });
                        });
                      }
                    }}
                    style={{ display: 'none' }}
                    id="photo-upload-edit"
                  />
                  <label
                    htmlFor="photo-upload-edit"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      backgroundColor: '#61bfac',
                      color: '#000',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}
                  >
                    📁 Uploader une photo
                  </label>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    ou utilisez une URL ci-dessous
                  </span>
                </div>

                {/* URL de la photo */}
                <input
                  type="url"
                  value={editingTalent.photoUrl}
                  onChange={(e) => setEditingTalent({ ...editingTalent, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg ou /images/talents/talent1.jpg"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
                
                {/* Options de photos prédéfinies */}
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Photos disponibles :</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['talent1.jpg', 'talent2.jpg', 'talent3.jpg'].map((photo) => (
                      <button
                        key={photo}
                        onClick={() => setEditingTalent({ ...editingTalent, photoUrl: `/images/talents/${photo}` })}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: editingTalent.photoUrl === `/images/talents/${photo}` ? '#ffcc00' : '#333',
                          color: editingTalent.photoUrl === `/images/talents/${photo}` ? '#000' : '#f5f5f7',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {photo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aperçu de la photo */}
                {editingTalent.photoUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Aperçu :</p>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: '#333',
                      border: '2px solid #ffcc00'
                    }}>
                      <img
                        src={getPhotoPreview(editingTalent.photoUrl)}
                        alt="Aperçu"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                  Ordre
                </label>
                <input
                  type="number"
                  value={editingTalent.order}
                  onChange={(e) => setEditingTalent({ ...editingTalent, order: parseInt(e.target.value) || 1 })}
                  min="1"
                  style={{
                    width: '100px',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleUpdateTalent}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingTalent(null)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#666',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedTalentsManager;
