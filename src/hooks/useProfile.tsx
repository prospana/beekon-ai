import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService, UserProfile } from '@/services/profileService';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const profileData = await profileService.getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const avatarUrl = await profileService.uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      return avatarUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setError('Failed to upload avatar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const deleteAvatar = useCallback(async () => {
    if (!user?.id || !profile?.avatar_url) return;

    setIsLoading(true);
    setError(null);
    try {
      await profileService.deleteAvatar(user.id, profile.avatar_url);
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      setError('Failed to delete avatar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile?.avatar_url]);

  const getInitials = useCallback(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  }, [profile?.first_name, profile?.last_name, user?.email]);

  const getDisplayName = useCallback(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'Account';
  }, [profile?.first_name, profile?.last_name, user?.email]);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    getInitials,
    getDisplayName,
  };
}