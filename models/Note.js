import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  publicity: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  }
}, {
  timestamps: true
});

// Create index for searching
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;