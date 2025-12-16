import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getBusinessProfile,
  updateBusinessProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getBusinessVerticals
} from '../services/business-profile.service';

export const getBusinessProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getBusinessProfile();
    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get business profile error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to get business profile'
    });
  }
};

export const updateBusinessProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const { about, address, description, email, vertical, websites } = req.body;

    // Validate websites array
    if (websites && !Array.isArray(websites)) {
      return res.status(400).json({ error: 'Websites must be an array' });
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const profileData: any = {};
    if (about !== undefined) profileData.about = about;
    if (address !== undefined) profileData.address = address;
    if (description !== undefined) profileData.description = description;
    if (email !== undefined) profileData.email = email;
    if (vertical !== undefined) profileData.vertical = vertical;
    if (websites !== undefined) profileData.websites = websites;

    const result = await updateBusinessProfile(profileData);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update business profile error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to update business profile'
    });
  }
};

export const uploadProfilePictureController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { buffer, mimetype } = req.file;

    // Validate image type
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    const result = await uploadProfilePicture(buffer, mimetype);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Upload profile picture error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to upload profile picture'
    });
  }
};

export const deleteProfilePictureController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteProfilePicture();
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete profile picture error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to delete profile picture'
    });
  }
};

export const getBusinessVerticalsController = async (req: AuthRequest, res: Response) => {
  try {
    const verticals = getBusinessVerticals();
    res.json({ success: true, verticals });
  } catch (error: any) {
    console.error('Get business verticals error:', error);
    res.status(500).json({ error: 'Failed to get business verticals' });
  }
};

export const updateDisplayNameController = async (req: AuthRequest, res: Response) => {
  try {
    const { display_name } = req.body;

    if (!display_name) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Validate display name length (3-100 characters)
    if (display_name.length < 3 || display_name.length > 100) {
      return res.status(400).json({ error: 'Display name must be between 3 and 100 characters' });
    }

    const { updateDisplayName } = require('../services/business-profile.service');
    const result = await updateDisplayName(display_name);
    
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Update display name error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to update display name'
    });
  }
};

export const getDisplayNameStatusController = async (req: AuthRequest, res: Response) => {
  try {
    const { getDisplayNameStatus, getNameStatusInfo } = require('../services/business-profile.service');
    const status = await getDisplayNameStatus();
    
    // Add status info
    const nameStatusInfo = status.name_status ? getNameStatusInfo(status.name_status) : null;
    
    res.json({
      success: true,
      data: {
        ...status,
        name_status_info: nameStatusInfo
      }
    });
  } catch (error: any) {
    console.error('Get display name status error:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to get display name status'
    });
  }
};
