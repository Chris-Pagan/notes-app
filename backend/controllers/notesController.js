const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

//@desc get all notes
//@route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = Note.find().lean();

  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  const getNotesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = Note.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );
  res.json(getNotesWithUser);
});

//@desc create a note
//@route POST /notes
//@access Private
const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const note = await Note.create({ user, title, text });

  if (note) {
    return res.status(201).json({ message: "Note created successfully" });
  } else {
    return res.status(400).json({ message: "Invalid data received" });
  }
});

//@desc Update a note
//@route PATCH /notes
//@access Private
const editNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== boolean) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note exists " });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;
  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} has been updated` });
});

//@desc Delete a note
//@route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = note.deleteOne();

  const reply = `Note ${result.title} with ID ${result._id} has been deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNote,
  updatedNote,
  deleteNote,
};
