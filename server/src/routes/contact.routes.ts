import express from 'express';
import {
  getContacts,
  createOrUpdateContact,
  deleteContact,
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../controllers/contact.controller';

const router = express.Router();

router.get('/', getContacts);
router.post('/', createOrUpdateContact);
router.delete('/:id', deleteContact);

router.get('/labels', getLabels);
router.post('/labels', createLabel);
router.put('/labels/:id', updateLabel);
router.delete('/labels/:id', deleteLabel);

export default router;
