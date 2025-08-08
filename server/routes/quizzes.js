const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Course = require('../models/Course');
const Presentation = require('../models/Presentation');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/quizzes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|mp4|mp3|wav/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images, videos, and audio files only!');
  }
}

// @route   GET api/quizzes
// @desc    Get all quizzes for a tenant
// @access  Private
router.get('/', [auth, tenantMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search, category, isPublished } = req.query;
    
    const query = { tenantId: req.tenantId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug');
    
    const total = await Quiz.countDocuments(query);
    
    res.json({
      quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('courses', 'title')
      .populate('presentations', 'title');
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/quizzes
// @desc    Create a quiz
// @access  Private (Creator only)
router.post('/', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('thumbnail'),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('estimatedTime', 'Estimated time is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    shortDescription,
    category,
    tags,
    questions,
    settings,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses,
    presentations
  } = req.body;

  try {
    // Create new quiz
    const quiz = new Quiz({
      title,
      description,
      shortDescription: shortDescription || '',
      thumbnail: req.file ? `/uploads/quizzes/${req.file.filename}` : 'default-quiz-thumbnail.jpg',
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      questions: questions || [],
      settings: settings || {},
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      estimatedTime,
      difficulty: difficulty || 'beginner',
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      targetAudience: targetAudience || [],
      tenantId: req.tenantId,
      createdBy: req.user.id,
      courses: courses || [],
      presentations: presentations || []
    });

    await quiz.save();

    // If courses are specified, add quiz to those courses
    if (courses && courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: courses }, tenantId: req.tenantId },
        { $push: { quizzes: quiz._id } }
      );
    }

    // If presentations are specified, add quiz to those presentations
    if (presentations && presentations.length > 0) {
      await Presentation.updateMany(
        { _id: { $in: presentations }, tenantId: req.tenantId },
        { $push: { quizzes: quiz._id } }
      );
    }

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id
// @desc    Update a quiz
// @access  Private (Creator only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('thumbnail'),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('estimatedTime', 'Estimated time is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    shortDescription,
    category,
    tags,
    questions,
    settings,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses,
    presentations
  } = req.body;

  try {
    let quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build quiz object
    const quizFields = {};
    if (title) quizFields.title = title;
    if (description) quizFields.description = description;
    if (shortDescription) quizFields.shortDescription = shortDescription;
    if (req.file) quizFields.thumbnail = `/uploads/quizzes/${req.file.filename}`;
    if (category) quizFields.category = category;
    if (tags) quizFields.tags = tags.split(',').map(tag => tag.trim());
    if (questions) quizFields.questions = questions;
    if (settings) quizFields.settings = settings;
    if (typeof isPublished !== 'undefined') quizFields.isPublished = isPublished;
    if (typeof isFeatured !== 'undefined') quizFields.isFeatured = isFeatured;
    if (estimatedTime) quizFields.estimatedTime = estimatedTime;
    if (difficulty) quizFields.difficulty = difficulty;
    if (prerequisites) quizFields.prerequisites = prerequisites;
    if (learningObjectives) quizFields.learningObjectives = learningObjectives;
    if (targetAudience) quizFields.targetAudience = targetAudience;
    if (courses) quizFields.courses = courses;
    if (presentations) quizFields.presentations = presentations;
    
    // Update quiz
    quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: quizFields },
      { new: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('courses', 'title')
      .populate('presentations', 'title');
    
    // Update courses if changed
    if (courses) {
      // Remove quiz from courses that are no longer selected
      await Course.updateMany(
        { quizzes: req.params.id, _id: { $nin: courses }, tenantId: req.tenantId },
        { $pull: { quizzes: req.params.id } }
      );
      
      // Add quiz to new courses
      await Course.updateMany(
        { _id: { $in: courses }, quizzes: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { quizzes: req.params.id } }
      );
    }
    
    // Update presentations if changed
    if (presentations) {
      // Remove quiz from presentations that are no longer selected
      await Presentation.updateMany(
        { quizzes: req.params.id, _id: { $nin: presentations }, tenantId: req.tenantId },
        { $pull: { quizzes: req.params.id } }
      );
      
      // Add quiz to new presentations
      await Presentation.updateMany(
        { _id: { $in: presentations }, quizzes: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { quizzes: req.params.id } }
      );
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/quizzes/:id
// @desc    Delete a quiz
// @access  Private (Creator only)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Remove quiz from courses
    await Course.updateMany(
      { quizzes: req.params.id, tenantId: req.tenantId },
      { $pull: { quizzes: req.params.id } }
    );
    
    // Remove quiz from presentations
    await Presentation.updateMany(
      { quizzes: req.params.id, tenantId: req.tenantId },
      { $pull: { quizzes: req.params.id } }
    );
    
    // Delete quiz attempts
    await QuizAttempt.deleteMany({ quizId: req.params.id, tenantId: req.tenantId });
    
    // Delete quiz
    await Quiz.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/publish
// @desc    Publish/unpublish a quiz
// @access  Private (Creator only)
router.put('/:id/publish', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle publish status
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/feature
// @desc    Feature/unfeature a quiz
// @access  Private (Admin or Creator)
router.put('/:id/feature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle feature status
    quiz.isFeatured = !quiz.isFeatured;
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/quizzes/:id/questions
// @desc    Add a question to a quiz
// @access  Private (Creator only)
router.post('/:id/questions', [
  auth,
  tenantMiddleware,
  isCreator,
  check('type', 'Question type is required').isIn(['multiple-choice', 'true-false', 'fill-blank', 'drag-drop', 'matching', 'essay']),
  check('question', 'Question is required').not().isEmpty(),
  check('points', 'Points are required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    type,
    question,
    options,
    correctAnswer,
    explanation,
    points,
    isRequired,
    media,
    order
  } = req.body;

  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new question
    const newQuestion = {
      type,
      question,
      options: options || [],
      correctAnswer: correctAnswer || '',
      explanation: explanation || '',
      points: points || 1,
      isRequired: isRequired !== undefined ? isRequired : true,
      media: media || [],
      order: order !== undefined ? order : quiz.questions.length
    };
    
    // Add question to quiz
    quiz.questions.push(newQuestion);
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/questions/:questionId
// @desc    Update a question in a quiz
// @access  Private (Creator only)
router.put('/:id/questions/:questionId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('type', 'Question type is required').isIn(['multiple-choice', 'true-false', 'fill-blank', 'drag-drop', 'matching', 'essay']),
  check('question', 'Question is required').not().isEmpty(),
  check('points', 'Points are required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    type,
    question,
    options,
    correctAnswer,
    explanation,
    points,
    isRequired,
    media,
    order
  } = req.body;

  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the question
    const questionIndex = quiz.questions.findIndex(q => q._id.toString() === req.params.questionId);
    
    if (questionIndex === -1) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    
    // Update question
    quiz.questions[questionIndex] = {
      ...quiz.questions[questionIndex],
      type,
      question,
      options: options || quiz.questions[questionIndex].options,
      correctAnswer: correctAnswer || quiz.questions[questionIndex].correctAnswer,
      explanation: explanation || quiz.questions[questionIndex].explanation,
      points: points || quiz.questions[questionIndex].points,
      isRequired: isRequired !== undefined ? isRequired : quiz.questions[questionIndex].isRequired,
      media: media || quiz.questions[questionIndex].media,
      order: order !== undefined ? order : quiz.questions[questionIndex].order
    };
    
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/quizzes/:id/questions/:questionId
// @desc    Delete a question from a quiz
// @access  Private (Creator only)
router.delete('/:id/questions/:questionId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find and remove the question
    const questionIndex = quiz.questions.findIndex(q => q._id.toString() === req.params.questionId);
    
    if (questionIndex === -1) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    
    quiz.questions.splice(questionIndex, 1);
    await quiz.save();

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/quizzes/:id/start
// @desc    Start a quiz attempt
// @access  Private (Learner only)
router.post('/:id/start', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    if (!quiz.isPublished) {
      return res.status(403).json({ msg: 'Quiz is not published' });
    }
    
    // Check if user has reached max retakes
    if (quiz.settings.maxRetakes > 0) {
      const attemptCount = await QuizAttempt.countDocuments({
        quizId: req.params.id,
        userId: req.user.id,
        tenantId: req.tenantId
      });
      
      if (attemptCount >= quiz.settings.maxRetakes) {
        return res.status(403).json({ msg: 'Maximum number of attempts reached' });
      }
    }
    
    // Get the attempt number
    const attemptCount = await QuizAttempt.countDocuments({
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    const attemptNumber = attemptCount + 1;
    
    // Prepare question order if shuffling is enabled
    let questionOrder = quiz.questions.map(q => q._id);
    if (quiz.settings.shuffleQuestions || quiz.settings.randomizeQuestionOrder) {
      // Shuffle the questions
      for (let i = questionOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionOrder[i], questionOrder[j]] = [questionOrder[j], questionOrder[i]];
      }
    }
    
    // Prepare option orders if shuffling is enabled
    let optionOrders = [];
    if (quiz.settings.shuffleOptions) {
      quiz.questions.forEach(question => {
        if (question.options && question.options.length > 0) {
          let optionOrder = question.options.map(o => o._id);
          // Shuffle the options
          for (let i = optionOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionOrder[i], optionOrder[j]] = [optionOrder[j], optionOrder[i]];
          }
          optionOrders.push({
            questionId: question._id,
            orders: optionOrder.map((id, index) => ({ optionId: id, order: index }))
          });
        }
      });
    }
    
    // Create new quiz attempt
    const quizAttempt = new QuizAttempt({
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId,
      attemptNumber,
      questionOrder,
      optionOrders,
      timeRemaining: quiz.settings.timeLimit > 0 ? quiz.settings.timeLimit * 60 : 0
    });
    
    await quizAttempt.save();

    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quizzes/:id/attempt/:attemptId
// @desc    Get a quiz attempt
// @access  Private
router.get('/:id/attempt/:attemptId', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quizAttempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!quizAttempt) {
      return res.status(404).json({ msg: 'Quiz attempt not found' });
    }
    
    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/attempt/:attemptId/answer
// @desc    Submit an answer for a question
// @access  Private
router.put('/:id/attempt/:attemptId/answer', [
  auth,
  tenantMiddleware,
  check('questionId', 'Question ID is required').not().isEmpty(),
  check('answer', 'Answer is required').not().isEmpty(),
  check('timeSpent', 'Time spent is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { questionId, answer, timeSpent } = req.body;

  try {
    const quizAttempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!quizAttempt) {
      return res.status(404).json({ msg: 'Quiz attempt not found' });
    }
    
    if (quizAttempt.status !== 'in-progress') {
      return res.status(403).json({ msg: 'Quiz attempt is not in progress' });
    }
    
    // Get the quiz to check the question
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Find the question
    const question = quiz.questions.find(q => q._id.toString() === questionId);
    
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }
    
    // Check if the answer is correct
    let isCorrect = false;
    let pointsEarned = 0;
    
    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption._id.toString() === answer;
        pointsEarned = isCorrect ? question.points : 0;
        break;
      case 'fill-blank':
        isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase();
        pointsEarned = isCorrect ? question.points : 0;
        break;
      case 'drag-drop':
      case 'matching':
        // For drag-drop and matching, we need to compare the answer array
        isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
        pointsEarned = isCorrect ? question.points : 0;
        break;
      case 'essay':
        // Essay questions need manual grading
        isCorrect = false;
        pointsEarned = 0;
        break;
      default:
        break;
    }
    
    // Check if the answer already exists
    const answerIndex = quizAttempt.answers.findIndex(a => a.questionId.toString() === questionId);
    
    if (answerIndex !== -1) {
      // Update existing answer
      quizAttempt.answers[answerIndex] = {
        ...quizAttempt.answers[answerIndex],
        answer,
        isCorrect,
        pointsEarned,
        timeSpent
      };
    } else {
      // Add new answer
      quizAttempt.answers.push({
        questionId,
        questionType: question.type,
        answer,
        isCorrect,
        pointsEarned,
        timeSpent,
        order: quizAttempt.answers.length
      });
    }
    
    // Update total time spent
    quizAttempt.timeSpent += timeSpent;
    
    // Update time remaining if there's a time limit
    if (quiz.settings.timeLimit > 0) {
      quizAttempt.timeRemaining = Math.max(0, quiz.settings.timeLimit * 60 - quizAttempt.timeSpent);
      
      // Check if time is up
      if (quizAttempt.timeRemaining === 0) {
        quizAttempt.status = 'timeout';
      }
    }
    
    await quizAttempt.save();

    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/attempt/:attemptId/submit
// @desc    Submit a quiz attempt
// @access  Private
router.put('/:id/attempt/:attemptId/submit', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quizAttempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!quizAttempt) {
      return res.status(404).json({ msg: 'Quiz attempt not found' });
    }
    
    if (quizAttempt.status !== 'in-progress') {
      return res.status(403).json({ msg: 'Quiz attempt is not in progress' });
    }
    
    // Get the quiz
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Calculate score
    let score = 0;
    let maxScore = 0;
    
    quiz.questions.forEach(question => {
      maxScore += question.points;
      
      const answer = quizAttempt.answers.find(a => a.questionId.toString() === question._id.toString());
      if (answer) {
        score += answer.pointsEarned;
      }
    });
    
    // Calculate percentage
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    // Check if passed
    const passed = percentage >= quiz.settings.passPercentage;
    
    // Update quiz attempt
    quizAttempt.score = score;
    quizAttempt.maxScore = maxScore;
    quizAttempt.percentage = percentage;
    quizAttempt.passed = passed;
    quizAttempt.status = 'completed';
    quizAttempt.completedAt = Date.now();
    
    await quizAttempt.save();
    
    // Update quiz statistics
    quiz.completionCount += 1;
    
    // Calculate average score
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      status: 'completed'
    });
    
    if (attempts.length > 0) {
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
      quiz.averageScore = Math.round(totalScore / attempts.length);
    }
    
    await quiz.save();

    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/attempt/:attemptId/pause
// @desc    Pause a quiz attempt
// @access  Private
router.put('/:id/attempt/:attemptId/pause', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quizAttempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!quizAttempt) {
      return res.status(404).json({ msg: 'Quiz attempt not found' });
    }
    
    if (quizAttempt.status !== 'in-progress') {
      return res.status(403).json({ msg: 'Quiz attempt is not in progress' });
    }
    
    // Get the quiz
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if pausing is allowed
    if (!quiz.settings.allowPause) {
      return res.status(403).json({ msg: 'Pausing is not allowed for this quiz' });
    }
    
    // Update quiz attempt
    quizAttempt.status = 'paused';
    quizAttempt.pausedAt = Date.now();
    
    await quizAttempt.save();

    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quizzes/:id/attempt/:attemptId/resume
// @desc    Resume a paused quiz attempt
// @access  Private
router.put('/:id/attempt/:attemptId/resume', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quizAttempt = await QuizAttempt.findOne({
      _id: req.params.attemptId,
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!quizAttempt) {
      return res.status(404).json({ msg: 'Quiz attempt not found' });
    }
    
    if (quizAttempt.status !== 'paused') {
      return res.status(403).json({ msg: 'Quiz attempt is not paused' });
    }
    
    // Get the quiz
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Calculate pause duration
    const pauseDuration = Date.now() - quizAttempt.pausedAt;
    
    // Update quiz attempt
    quizAttempt.status = 'in-progress';
    quizAttempt.resumedAt = Date.now();
    
    // Adjust time remaining if there's a time limit
    if (quiz.settings.timeLimit > 0) {
      quizAttempt.timeRemaining = Math.max(0, quizAttempt.timeRemaining - Math.floor(pauseDuration / 1000));
      
      // Check if time is up
      if (quizAttempt.timeRemaining === 0) {
        quizAttempt.status = 'timeout';
      }
    }
    
    await quizAttempt.save();

    res.json(quizAttempt);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quizzes/:id/attempts
// @desc    Get all attempts for a quiz by a user
// @access  Private
router.get('/:id/attempts', [auth, tenantMiddleware], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      userId: req.user.id,
      tenantId: req.tenantId
    }).sort({ createdAt: -1 });
    
    res.json(attempts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quizzes/:id/results
// @desc    Get quiz results for all users (for creators)
// @access  Private (Creator only)
router.get('/:id/results', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      tenantId: req.tenantId
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(attempts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;