const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['MCQ', 'TrueFalse', 'FillBlank'],
    default: 'MCQ'
  },
  options: [String],
  correctOption: Number,
  explanation: String,
  subject: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  marks: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: String,
  createdOptions: {
    timeLimit: { type: Number, default: 60 }, // minutes or seconds
    marksPerQuestion: { type: Number, default: 1 },
    negativeMarking: { type: Number, default: 0 }, // e.g. 0.25
    passingPercentage: { type: Number, default: 40 },
    randomizeQuestions: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: true },
    enableAntiCheating: { type: Boolean, default: true }
  },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);