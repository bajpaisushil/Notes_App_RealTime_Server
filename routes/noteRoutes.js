import express from 'express';
import { check } from 'express-validator';
import { 
  getNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote,
  searchNotes,
  getNoteCategories
} from '../controllers/noteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all notes
router.get('/', getNotes);

// Get note categories
router.get('/categories', getNoteCategories);

// Search notes
router.get('/search', searchNotes);

// Get single note
router.get('/:id', getNoteById);

// Create note
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty()
  ],
  createNote
);

// Update note
router.put(
  '/:id',
  [
    check('title', 'Title is required').not().isEmpty()
  ],
  updateNote
);

// Delete note
router.delete('/:id', deleteNote);

export default router;