import express from 'express';
import { getRules, createRule, updateRule, deleteRule, toggleRule } from '../controllers/auto-reply.controller';

const router = express.Router();

router.get('/', getRules);
router.post('/', createRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);
router.post('/:id/toggle', toggleRule);

export default router;
