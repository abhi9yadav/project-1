import express from 'express';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all sheets
router.get('/sheets', async (req, res) => {
  try {
    const sheets = ['1-month', '3-months', '6-months'];
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get questions by sheet
router.get('/sheet/:sheet', async (req, res) => {
  try {
    const questions = await Question.find({ sheet: req.params.sheet })
      .populate('similarQuestions', 'title level');
    
    // Group by topic and subtopic
    const grouped = questions.reduce((acc, question) => {
      if (!acc[question.topic]) {
        acc[question.topic] = {};
      }
      if (!acc[question.topic][question.subtopic]) {
        acc[question.topic][question.subtopic] = [];
      }
      acc[question.topic][question.subtopic].push(question);
      return acc;
    }, {});
    
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('similarQuestions', 'title level questionLink');
    
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark question as solved
router.post('/:id/solve', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const alreadySolved = user.solvedQuestions.some(
      q => q.questionId.toString() === req.params.id
    );

    if (alreadySolved) {
      // Remove from solved (toggle off)
      user.solvedQuestions = user.solvedQuestions.filter(
        q => q.questionId.toString() !== req.params.id
      );
    } else {
      // Add to solved
      user.solvedQuestions.push({ questionId: req.params.id });
    }

    await user.save();
    res.json({ message: 'Question status updated', solvedQuestions: user.solvedQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Star/Unstar question
router.post('/:id/star', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const alreadyStarred = user.starredQuestions.some(
      q => q.questionId.toString() === req.params.id
    );

    if (alreadyStarred) {
      user.starredQuestions = user.starredQuestions.filter(
        q => q.questionId.toString() !== req.params.id
      );
    } else {
      user.starredQuestions.push({ questionId: req.params.id });
    }

    await user.save();
    res.json({ message: 'Star status updated', starredQuestions: user.starredQuestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/Update note for question
router.post('/:id/note', protect, async (req, res) => {
  try {
    const { note } = req.body;
    const user = await User.findById(req.user._id);
    
    const existingNoteIndex = user.notes.findIndex(
      n => n.questionId.toString() === req.params.id
    );

    if (existingNoteIndex >= 0) {
      if (note.trim() === '') {
        // Delete note if empty
        user.notes.splice(existingNoteIndex, 1);
      } else {
        // Update existing note
        user.notes[existingNoteIndex].note = note;
      }
    } else {
      // Add new note
      user.notes.push({ questionId: req.params.id, note });
    }

    await user.save();
    res.json({ message: 'Note updated', notes: user.notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user progress
router.get('/progress/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('solvedQuestions.questionId');
    
    const stats = {
      total: user.solvedQuestions.length,
      easy: 0,
      medium: 0,
      hard: 0
    };

    user.solvedQuestions.forEach(sq => {
      if (sq.questionId) {
        stats[sq.questionId.level]++;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN ROUTES
// Create question (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, sheet, topic, subtopic, level, questionLink, videoLink, resources, similarQuestions } = req.body;
    
    const question = await Question.create({
      title,
      sheet,
      topic,
      subtopic,
      level,
      questionLink,
      videoLink,
      resources,
      similarQuestions
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update question (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      // Required fields: keep existing value if a new one isn't provided.
      question.title = req.body.title || question.title;
      question.sheet = req.body.sheet || question.sheet;
      question.topic = req.body.topic || question.topic;
      question.subtopic = req.body.subtopic || question.subtopic;
      question.level = req.body.level || question.level;
      question.questionLink = req.body.questionLink || question.questionLink;
      // Optional fields: allow explicit values, including clearing to empty.
      if (req.body.videoLink !== undefined) question.videoLink = req.body.videoLink;
      if (req.body.resources !== undefined) question.resources = req.body.resources;
      if (req.body.similarQuestions !== undefined) question.similarQuestions = req.body.similarQuestions;

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete question (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      await Question.deleteOne({ _id: req.params.id });
      res.json({ message: 'Question removed' });
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
