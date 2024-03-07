const User = require('../models/User')
const Note = require('../models/Note')

const asyncHandler = require('express-async-handler') // Middleware to keep us from using too many try-catch blocks
const bcrypt = require('bcrypt') // Password encrypting

// @desc    Get all notes
// @route   GET /notes
// @access  Private
const getAllNotes = asyncHandler(async (req, res) => {
  //Get all 
  const notes = await Note.find().lean()

  //If none
  if (!notes?.length) {
    return res.status(400).json({ message: 'No notes found'})
  }

  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec()
    return { ...note, username: user.username}
  }))

  res.json(notesWithUser)
})

// @desc    Create a new note
// @route   POST /notes
// @access  Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body

  //Confirm data
  if(!user || !title || !text ) {
    return res.status(400).json({ message: 'Please fill in all fields' })
  }

  //Check duplicates
  const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: 'Note with the same title already exists' })
  }

  //Create and store new note
  const noteObject = { user, title, text }

  const note = await Note.create(noteObject)

  if (note) { //created
    res.status(201).json({ message: `New note '${note.title}' created`})
  } else {
    res.status(400).json({ message: 'Invalid note data received' })
  }

})

// @desc    Update a note
// @route   PATCH /notes
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body

  //Confirm data
  if(!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Please fill in all fields' })
  }

  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: 'Note not found' })
}

  //Check duplicate
  const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

  //Allow updates to original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate note' })
  }

  //Update note with new data
  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  res.json({ message: `${updatedNote.title} updated`})
})


// @desc    Delete a note
// @route   DELETE /notes
// @access  Private
const deleteNote= asyncHandler(async (req, res) => {
  const { id } = req.body

  //Confirm data
  if (!id) {
    return res.status(400).json({ message: 'Note id required' })
  }

  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: 'Note not found' })
  }

  //Delete note
  const result = await note.deleteOne()

  const reply = `Note '${note.title}' with ID ${note._id} deleted`

  res.json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote
}