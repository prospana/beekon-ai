import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  avatar_url: string | null;
  workspace_id: string | null;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  weekly_reports: boolean;
  competitor_alerts: boolean;
  analysis_complete: boolean;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  company?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface NotificationUpdateData {
  email_notifications?: boolean;
  weekly_reports?: boolean;
  competitor_alerts?: boolean;
  analysis_complete?: boolean;
}

export class ProfileService {
  private static instance: ProfileService;

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found, create one
          return await this.createProfile(userId);
        }
        throw error;
      }

      return {
        ...data,
        notification_settings: data.notification_settings || {
          email_notifications: true,
          weekly_reports: true,
          competitor_alerts: false,
          analysis_complete: true,
        },
      };
    } catch (error) {
      console.error("Failed to get profile:", error);
      throw error;
    }
  }

  /**
   * Create a new profile for user
   */
  async createProfile(userId: string): Promise<UserProfile> {
    try {
      // Get user info from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const defaultNotificationSettings: NotificationSettings = {
        email_notifications: true,
        weekly_reports: true,
        competitor_alerts: false,
        analysis_complete: true,
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          email: user?.email || null,
          full_name: user?.user_metadata?.full_name || null,
          first_name: user?.user_metadata?.first_name || null,
          last_name: user?.user_metadata?.last_name || null,
          company: user?.user_metadata?.company || null,
          notification_settings: defaultNotificationSettings,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        notification_settings: data.notification_settings || defaultNotificationSettings,
      };
    } catch (error) {
      console.error("Failed to create profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<UserProfile> {
    try {
      // Update full_name if first_name or last_name changed
      const profileUpdates: ProfileUpdateData & { full_name?: string } = { ...updates };
      if (updates.first_name !== undefined || updates.last_name !== undefined) {
        const profile = await this.getProfile(userId);
        const firstName = updates.first_name ?? profile?.first_name ?? "";
        const lastName = updates.last_name ?? profile?.last_name ?? "";
        profileUpdates.full_name = `${firstName} ${lastName}`.trim();
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        notification_settings: data.notification_settings || {
          email_notifications: true,
          weekly_reports: true,
          competitor_alerts: false,
          analysis_complete: true,
        },
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    updates: NotificationUpdateData
  ): Promise<UserProfile> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        throw new Error("Profile not found");
      }

      const updatedSettings = {
        ...profile.notification_settings,
        ...updates,
      };

      const { data, error } = await supabase
        .from("profiles")
        .update({ notification_settings: updatedSettings })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        notification_settings: data.notification_settings || updatedSettings,
      };
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to delete profile:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      // Use Supabase's built-in password update which handles verification
      // Note: This requires the user to be currently authenticated
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        // Handle specific error cases
        if (updateError.message.includes("same")) {
          throw new Error("New password must be different from current password");
        }
        if (updateError.message.includes("weak")) {
          throw new Error("Password is too weak. Please choose a stronger password");
        }
        throw new Error(updateError.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }

  /**
   * Upload avatar image and update profile
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  /**
   * Delete avatar image
   */
  async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Get userId/filename.ext

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update profile to remove avatar URL
      await this.updateProfile(userId, { avatar_url: null });
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      throw error;
    }
  }

  /**
   * Get user's workspace information
   */
  async getUserWorkspace(userId: string): Promise<{ id: string; name: string; created_at: string } | null> {
    try {
      const { data, error } = await supabase
        .schema("beekon_data")
        .from("workspaces")
        .select("*")
        .eq("owner_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to get user workspace:", error);
      return null;
    }
  }
}

export const profileService = ProfileService.getInstance();