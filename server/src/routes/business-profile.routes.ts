import express from 'express';
import multer from 'multer';
import {
  getBusinessProfileController,
  updateBusinessProfileController,
  uploadProfilePictureController,
  deleteProfilePictureController,
  getBusinessVerticalsController,
  updateDisplayNameController,
  getDisplayNameStatusController
} from '../controllers/business-profile.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get business profile
router.get('/', getBusinessProfileController);

// Update business profile
router.put('/', updateBusinessProfileController);

// Upload profile picture
router.post('/picture', upload.single('image'), uploadProfilePictureController);

// Delete profile picture
router.delete('/picture', deleteProfilePictureController);

// Get available business verticals (categories)
router.get('/verticals', getBusinessVerticalsController);

// Update display name
router.post('/display-name', updateDisplayNameController);

// Get display name status
router.get('/display-name/status', getDisplayNameStatusController);

export default router;
