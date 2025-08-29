import { useState, useEffect } from 'react';
import { UserProfile, UserRole, ApiResponse } from '../types';
import { UserService } from '../services/userService';

export const useProfile = (userId?: string, role?: UserRole) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!userId || !role) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result: ApiResponse<UserProfile>;
      
      if (role) {
        result = await UserService.getCurrentProfile(userId, role);
      } else {
        result = await UserService.getProfileById(userId);
      }
      
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        // Try to create profile if it doesn't exist
        if (role) {
          const createResult = await UserService.createProfile(userId, '', role);
          if (createResult.success) {
            const newResult = await UserService.getCurrentProfile(userId, role);
            if (newResult.success && newResult.data) {
              setProfile(newResult.data);
            }
          }
        }
        setError(result.error || 'Profil non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId || !role || !profile) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await UserService.updateProfile(userId, role, updates);
      
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
        return true;
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId, role]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    setProfile
  };
};