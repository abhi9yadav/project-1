import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sheet: {
    type: String,
    enum: ['1-month', '3-months', '6-months'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subtopic: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  questionLink: {
    type: String,
    required: true
  },
  videoLink: {
    type: String
  },
  resources: [{
    title: String,
    url: String
  }],
  similarQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
