import { validationResult } from "express-validator";
import Note from "../models/Note.js";

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const personalNotes = await Note.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    const publicNotes = await Note.find({ publicity: "public" });
    const notes = [...personalNotes, ...publicNotes];
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, category, publicity } = req.body;

  try {
    const note = await Note.create({
      user: req.user._id,
      title,
      content,
      category: category || "General",
      publicity: publicity || "private",
    });

    // Emit socket event for real-time update
    const io=req.app.get('io');
    if (note.publicity === "public") {
      io.emit("noteCreated", note);
    } else {
      io.to(req.user._id.toString()).emit("noteCreated", note);
    }

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, category, publicity } = req.body;

  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, category, publicity },
      { new: true, runValidators: true }
    );

    const io = req.app.get("io");
    if (note.publicity === "public") {
      io.emit("noteUpdated", note);
    } else {
      io.to(req.user._id.toString()).emit("noteUpdated", note);
    }

    res.json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await note.deleteOne();

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (note.publicity === "public") {
      io.emit("noteDeleted", note);
    } else {
      io.to(req.user._id.toString()).emit("noteDeleted", note);
    }

    res.json({ message: "Note removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Search notes
// @route   GET /api/notes/search
// @access  Private
export const searchNotes = async (req, res) => {
  const { query, category } = req.query;

  try {
    let searchQuery = { user: req.user._id };

    // Add text search if query provided
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Add category filter if provided
    if (category && category !== "All") {
      searchQuery.category = category;
    }

    const notes = await Note.find(searchQuery).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get note categories
// @route   GET /api/notes/categories
// @access  Private
export const getNoteCategories = async (req, res) => {
  try {
    const categories = await Note.distinct("category", { user: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
