const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { UserProgress, SystemMetrics, ContentEngagement } = require('../models/Analytics');
const Course = require('../models/Course');
const Presentation = require('../models/Presentation');
const Quiz = require('../models/Quiz');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner, isAdmin } = require('../middleware/auth');

// @route   GET api/analytics/user-progress
// @desc    Get user progress for all content
// @access  Private
router.get('/user-progress', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const { contentType, status } = req.query;
    
    const query = { userId: req.user.id, tenantId: req.tenantId };
    
    if (contentType) {
      query.contentType = contentType;
    }
    
    if (status) {
      query.status = status;
    }
    
    const userProgress = await UserProgress.find(query)
      .populate('contentId', 'title thumbnail')
      .populate('courseId', 'title')
      .populate('presentationId', 'title')
      .populate('quizId', 'title')
      .populate('tutorialId', 'title')
      .sort({ lastAccessed: -1 });
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/user-progress/:contentId
// @desc    Get user progress for a specific content
// @access  Private
router.get('/user-progress/:contentId', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({
      userId: req.user.id,
      contentId: req.params.contentId,
      tenantId: req.tenantId
    })
      .populate('contentId', 'title thumbnail')
      .populate('slidesViewed.slideId', 'title')
      .populate('stepsCompleted.stepId', 'title')
      .populate('quizAttempts.answers.questionId', 'questionText options');
    
    if (!userProgress) {
      return res.status(404).json({ msg: 'Progress not found' });
    }
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/analytics/user-progress/:contentId
// @desc    Create or update user progress for a content
// @access  Private
router.post('/user-progress/:contentId', [
  auth,
  tenantMiddleware,
  isCreatorOrLearner,
  check('contentType', 'Content type is required').isIn(['course', 'presentation', 'quiz', 'tutorial'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { contentType, progress, timeSpent } = req.body;

  try {
    let userProgress = await UserProgress.findOne({
      userId: req.user.id,
      contentId: req.params.contentId,
      tenantId: req.tenantId
    });
    
    if (userProgress) {
      // Update existing progress
      if (progress !== undefined) {
        await userProgress.updateProgress(progress);
      }
      
      if (timeSpent !== undefined) {
        await userProgress.addTimeSpent(timeSpent);
      }
      
      userProgress = await UserProgress.findById(userProgress._id)
        .populate('contentId', 'title thumbnail')
        .populate('slidesViewed.slideId', 'title')
        .populate('stepsCompleted.stepId', 'title')
        .populate('quizAttempts.answers.questionId', 'questionText options');
    } else {
      // Create new progress record
      userProgress = new UserProgress({
        userId: req.user.id,
        contentId: req.params.contentId,
        contentType,
        tenantId: req.tenantId,
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        status: progress > 0 ? 'in-progress' : 'not-started'
      });
      
      await userProgress.save();
      
      userProgress = await UserProgress.findById(userProgress._id)
        .populate('contentId', 'title thumbnail')
        .populate('slidesViewed.slideId', 'title')
        .populate('stepsCompleted.stepId', 'title')
        .populate('quizAttempts.answers.questionId', 'questionText options');
    }
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/analytics/user-progress/:contentId/slide/:slideId
// @desc    Record slide view
// @access  Private
router.put('/user-progress/:contentId/slide/:slideId', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  const { timeSpent = 0 } = req.body;

  try {
    let userProgress = await UserProgress.findOne({
      userId: req.user.id,
      contentId: req.params.contentId,
      tenantId: req.tenantId
    });
    
    if (!userProgress) {
      // Create new progress record
      userProgress = new UserProgress({
        userId: req.user.id,
        contentId: req.params.contentId,
        contentType: 'presentation',
        tenantId: req.tenantId,
        progress: 0,
        timeSpent: 0,
        status: 'in-progress'
      });
    }
    
    await userProgress.recordSlideView(req.params.slideId, timeSpent);
    
    // Calculate progress based on slides viewed
    const presentation = await Presentation.findById(req.params.contentId);
    if (presentation && presentation.slides) {
      const progress = Math.round((userProgress.slidesViewed.length / presentation.slides.length) * 100);
      await userProgress.updateProgress(progress);
    }
    
    userProgress = await UserProgress.findById(userProgress._id)
      .populate('contentId', 'title thumbnail')
      .populate('slidesViewed.slideId', 'title')
      .populate('stepsCompleted.stepId', 'title')
      .populate('quizAttempts.answers.questionId', 'questionText options');
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/analytics/user-progress/:contentId/step/:stepId
// @desc    Record step completion
// @access  Private
router.put('/user-progress/:contentId/step/:stepId', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  const { timeSpent = 0 } = req.body;

  try {
    let userProgress = await UserProgress.findOne({
      userId: req.user.id,
      contentId: req.params.contentId,
      tenantId: req.tenantId
    });
    
    if (!userProgress) {
      // Create new progress record
      userProgress = new UserProgress({
        userId: req.user.id,
        contentId: req.params.contentId,
        contentType: 'tutorial',
        tenantId: req.tenantId,
        progress: 0,
        timeSpent: 0,
        status: 'in-progress'
      });
    }
    
    await userProgress.recordStepCompletion(req.params.stepId, timeSpent);
    
    // Calculate progress based on steps completed
    const tutorial = await Tutorial.findById(req.params.contentId);
    if (tutorial && tutorial.steps) {
      const progress = Math.round((userProgress.stepsCompleted.length / tutorial.steps.length) * 100);
      await userProgress.updateProgress(progress);
    }
    
    userProgress = await UserProgress.findById(userProgress._id)
      .populate('contentId', 'title thumbnail')
      .populate('slidesViewed.slideId', 'title')
      .populate('stepsCompleted.stepId', 'title')
      .populate('quizAttempts.answers.questionId', 'questionText options');
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/analytics/user-progress/:contentId/quiz-attempt
// @desc    Record quiz attempt
// @access  Private
router.post('/user-progress/:contentId/quiz-attempt', [
  auth,
  tenantMiddleware,
  isCreatorOrLearner,
  check('answers', 'Answers are required').isArray(),
  check('score', 'Score is required').isNumeric(),
  check('passed', 'Passed status is required').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { answers, score, passed } = req.body;

  try {
    let userProgress = await UserProgress.findOne({
      userId: req.user.id,
      contentId: req.params.contentId,
      tenantId: req.tenantId
    });
    
    if (!userProgress) {
      // Create new progress record
      userProgress = new UserProgress({
        userId: req.user.id,
        contentId: req.params.contentId,
        contentType: 'quiz',
        tenantId: req.tenantId,
        progress: 0,
        timeSpent: 0,
        status: 'in-progress'
      });
    }
    
    await userProgress.addQuizAttempt(answers, score, passed);
    
    userProgress = await UserProgress.findById(userProgress._id)
      .populate('contentId', 'title thumbnail')
      .populate('slidesViewed.slideId', 'title')
      .populate('stepsCompleted.stepId', 'title')
      .populate('quizAttempts.answers.questionId', 'questionText options');
    
    res.json(userProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/content-engagement
// @desc    Get content engagement analytics
// @access  Private (Creator or Admin)
router.get('/content-engagement', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const { contentType, startDate, endDate, limit = 10 } = req.query;
    
    const query = { tenantId: req.tenantId };
    
    if (contentType) {
      query.contentType = contentType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const contentEngagement = await ContentEngagement.find(query)
      .sort({ views: -1 })
      .limit(parseInt(limit))
      .populate('contentId', 'title thumbnail');
    
    res.json(contentEngagement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/system-metrics
// @desc    Get system metrics
// @access  Private (Admin)
router.get('/system-metrics', [auth, tenantMiddleware, isAdmin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    if (req.tenantId) {
      query.tenantId = req.tenantId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    const systemMetrics = await SystemMetrics.find(query)
      .sort({ date: -1 });
    
    res.json(systemMetrics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/user-stats
// @desc    Get user statistics
// @access  Private (Creator or Admin)
router.get('/user-stats', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all users for the tenant
    const users = await User.find({ tenantId: req.tenantId });
    
    // Get user progress for all content
    const userProgressQuery = { tenantId: req.tenantId };
    
    if (startDate || endDate) {
      userProgressQuery.createdAt = {};
      if (startDate) {
        userProgressQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        userProgressQuery.createdAt.$lte = new Date(endDate);
      }
    }
    
    const userProgress = await UserProgress.find(userProgressQuery);
    
    // Calculate statistics
    const stats = {
      totalUsers: users.length,
      activeUsers: 0,
      contentViews: 0,
      contentCompletions: 0,
      averageTimeSpent: 0,
      topContent: [],
      userDistribution: {
        byRole: {},
        byStatus: {
          'not-started': 0,
          'in-progress': 0,
          'completed': 0
        }
      }
    };
    
    // Calculate user distribution by role
    users.forEach(user => {
      if (!stats.userDistribution.byRole[user.role]) {
        stats.userDistribution.byRole[user.role] = 0;
      }
      stats.userDistribution.byRole[user.role]++;
    });
    
    // Calculate progress statistics
    let totalTimeSpent = 0;
    const contentViewsMap = {};
    const contentCompletionsMap = {};
    
    userProgress.forEach(progress => {
      // Count active users (users who have accessed content)
      if (progress.progress > 0) {
        stats.activeUsers++;
      }
      
      // Count content views
      stats.contentViews++;
      
      // Count content completions
      if (progress.status === 'completed') {
        stats.contentCompletions++;
      }
      
      // Sum time spent
      totalTimeSpent += progress.timeSpent;
      
      // Count user distribution by status
      stats.userDistribution.byStatus[progress.status]++;
      
      // Track content views by content
      if (!contentViewsMap[progress.contentId]) {
        contentViewsMap[progress.contentId] = {
          contentId: progress.contentId,
          contentType: progress.contentType,
          views: 0,
          completions: 0
        };
      }
      contentViewsMap[progress.contentId].views++;
      
      // Track content completions by content
      if (progress.status === 'completed') {
        if (!contentCompletionsMap[progress.contentId]) {
          contentCompletionsMap[progress.contentId] = {
            contentId: progress.contentId,
            contentType: progress.contentType,
            completions: 0
          };
        }
        contentCompletionsMap[progress.contentId].completions++;
      }
    });
    
    // Calculate average time spent
    stats.averageTimeSpent = userProgress.length > 0 ? totalTimeSpent / userProgress.length : 0;
    
    // Get top content by views
    const topContentByViews = Object.values(contentViewsMap)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    
    // Get content details for top content
    const topContentDetails = await Promise.all(
      topContentByViews.map(async (item) => {
        let content;
        switch (item.contentType) {
          case 'course':
            content = await Course.findById(item.contentId).select('title thumbnail');
            break;
          case 'presentation':
            content = await Presentation.findById(item.contentId).select('title thumbnail');
            break;
          case 'quiz':
            content = await Quiz.findById(item.contentId).select('title thumbnail');
            break;
          case 'tutorial':
            content = await Tutorial.findById(item.contentId).select('title thumbnail');
            break;
          default:
            content = null;
        }
        
        return {
          ...item,
          content
        };
      })
    );
    
    stats.topContent = topContentDetails;
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/analytics/content-stats/:contentType/:contentId
// @desc    Get statistics for a specific content
// @access  Private (Creator or Admin)
router.get('/content-stats/:contentType/:contentId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    // Get user progress for the content
    const userProgress = await UserProgress.find({
      contentId,
      contentType,
      tenantId: req.tenantId
    }).populate('userId', 'firstName lastName email');
    
    // Calculate statistics
    const stats = {
      totalViews: userProgress.length,
      uniqueViews: new Set(userProgress.map(p => p.userId._id.toString())).size,
      completions: userProgress.filter(p => p.status === 'completed').length,
      averageProgress: 0,
      averageTimeSpent: 0,
      dropOffPoints: [],
      userProgress: userProgress.map(p => ({
        userId: p.userId._id,
        userName: `${p.userId.firstName} ${p.userId.lastName}`,
        userEmail: p.userId.email,
        status: p.status,
        progress: p.progress,
        timeSpent: p.timeSpent,
        lastAccessed: p.lastAccessed,
        completedAt: p.completedAt
      }))
    };
    
    // Calculate average progress
    if (userProgress.length > 0) {
      const totalProgress = userProgress.reduce((sum, p) => sum + p.progress, 0);
      stats.averageProgress = totalProgress / userProgress.length;
      
      // Calculate average time spent
      const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
      stats.averageTimeSpent = totalTimeSpent / userProgress.length;
    }
    
    // Calculate drop-off points (this would be more sophisticated in a real implementation)
    if (contentType === 'presentation') {
      const presentation = await Presentation.findById(contentId);
      if (presentation && presentation.slides) {
        presentation.slides.forEach((slide, index) => {
          const slideViewCount = userProgress.filter(p => 
            p.slidesViewed && p.slidesViewed.some(sv => sv.slideId.toString() === slide._id.toString())
          ).length;
          
          if (index < presentation.slides.length - 1) {
            const nextSlideViewCount = userProgress.filter(p => 
              p.slidesViewed && p.slidesViewed.some(sv => sv.slideId.toString() === presentation.slides[index + 1]._id.toString())
            ).length;
            
            const dropOffCount = slideViewCount - nextSlideViewCount;
            if (dropOffCount > 0) {
              stats.dropOffPoints.push({
                point: `After slide ${index + 1}: ${slide.title}`,
                count: dropOffCount
              });
            }
          }
        });
      }
    }
    
    // Sort drop-off points by count
    stats.dropOffPoints.sort((a, b) => b.count - a.count);
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;