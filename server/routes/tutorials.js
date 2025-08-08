const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tutorial = require('../models/Tutorial');
const Screenshot = require('../models/Screenshot');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/tutorials');
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
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// @route   GET api/tutorials
// @desc    Get all tutorials for a tenant
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
    
    const tutorials = await Tutorial.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('screenshots', 'title thumbnailUrl')
      .populate('courses', 'title');
    
    const total = await Tutorial.countDocuments(query);
    
    res.json({
      tutorials,
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

// @route   GET api/tutorials/:id
// @desc    Get tutorial by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('screenshots', 'title thumbnailUrl imageUrl')
      .populate('steps.screenshot', 'title thumbnailUrl imageUrl')
      .populate('courses', 'title');
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tutorials
// @desc    Create a tutorial
// @access  Private (Creator only)
router.post('/', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('thumbnail'),
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    shortDescription,
    tags,
    category,
    difficulty,
    estimatedTime,
    isPublished,
    isFeatured,
    screenshots,
    steps,
    courses
  } = req.body;

  try {
    // Create new tutorial
    const tutorial = new Tutorial({
      title,
      description: description || '',
      shortDescription: shortDescription || '',
      thumbnail: req.file ? `/uploads/tutorials/${req.file.filename}` : 'default-tutorial-thumbnail.jpg',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || 5,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      screenshots: screenshots || [],
      steps: steps || [],
      tenantId: req.tenantId,
      createdBy: req.user.id,
      courses: courses || []
    });

    await tutorial.save();

    // If screenshots are specified, add tutorial to those screenshots
    if (screenshots && screenshots.length > 0) {
      await Screenshot.updateMany(
        { _id: { $in: screenshots }, tenantId: req.tenantId },
        { $push: { tutorials: tutorial._id } }
      );
    }

    // If courses are specified, add tutorial to those courses
    if (courses && courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: courses }, tenantId: req.tenantId },
        { $push: { tutorials: tutorial._id } }
      );
    }

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id
// @desc    Update a tutorial
// @access  Private (Creator only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('thumbnail'),
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    shortDescription,
    tags,
    category,
    difficulty,
    estimatedTime,
    isPublished,
    isFeatured,
    screenshots,
    steps,
    courses
  } = req.body;

  try {
    let tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build tutorial object
    const tutorialFields = {};
    if (title) tutorialFields.title = title;
    if (description) tutorialFields.description = description;
    if (shortDescription) tutorialFields.shortDescription = shortDescription;
    if (req.file) tutorialFields.thumbnail = `/uploads/tutorials/${req.file.filename}`;
    if (tags) tutorialFields.tags = tags.split(',').map(tag => tag.trim());
    if (category) tutorialFields.category = category;
    if (difficulty) tutorialFields.difficulty = difficulty;
    if (estimatedTime) tutorialFields.estimatedTime = estimatedTime;
    if (typeof isPublished !== 'undefined') tutorialFields.isPublished = isPublished;
    if (typeof isFeatured !== 'undefined') tutorialFields.isFeatured = isFeatured;
    if (screenshots) tutorialFields.screenshots = screenshots;
    if (steps) tutorialFields.steps = steps;
    if (courses) tutorialFields.courses = courses;
    
    // Update tutorial
    tutorial = await Tutorial.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: tutorialFields },
      { new: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('screenshots', 'title thumbnailUrl')
      .populate('steps.screenshot', 'title thumbnailUrl imageUrl')
      .populate('courses', 'title');
    
    // Update screenshots if changed
    if (screenshots) {
      // Remove tutorial from screenshots that are no longer selected
      await Screenshot.updateMany(
        { tutorials: req.params.id, _id: { $nin: screenshots }, tenantId: req.tenantId },
        { $pull: { tutorials: req.params.id } }
      );
      
      // Add tutorial to new screenshots
      await Screenshot.updateMany(
        { _id: { $in: screenshots }, tutorials: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { tutorials: req.params.id } }
      );
    }
    
    // Update courses if changed
    if (courses) {
      // Remove tutorial from courses that are no longer selected
      await Course.updateMany(
        { tutorials: req.params.id, _id: { $nin: courses }, tenantId: req.tenantId },
        { $pull: { tutorials: req.params.id } }
      );
      
      // Add tutorial to new courses
      await Course.updateMany(
        { _id: { $in: courses }, tutorials: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { tutorials: req.params.id } }
      );
    }
    
    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tutorials/:id
// @desc    Delete a tutorial
// @access  Private (Creator only)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Remove tutorial from screenshots
    await Screenshot.updateMany(
      { tutorials: req.params.id, tenantId: req.tenantId },
      { $pull: { tutorials: req.params.id } }
    );
    
    // Remove tutorial from courses
    await Course.updateMany(
      { tutorials: req.params.id, tenantId: req.tenantId },
      { $pull: { tutorials: req.params.id } }
    );
    
    // Delete tutorial
    await Tutorial.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Tutorial removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id/publish
// @desc    Publish/unpublish a tutorial
// @access  Private (Creator only)
router.put('/:id/publish', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle publish status
    tutorial.isPublished = !tutorial.isPublished;
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id/feature
// @desc    Feature/unfeature a tutorial
// @access  Private (Admin or Creator)
router.put('/:id/feature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator or admin
    if (tutorial.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle feature status
    tutorial.isFeatured = !tutorial.isFeatured;
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tutorials/:id/steps
// @desc    Add a step to a tutorial
// @access  Private (Creator only)
router.post('/:id/steps', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty(),
  check('order', 'Order is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    screenshot,
    order,
    duration
  } = req.body;

  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new step
    const step = {
      title,
      description: description || '',
      screenshot,
      order,
      duration: duration || 0
    };
    
    // Add step to tutorial
    tutorial.steps.push(step);
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id/steps/:stepId
// @desc    Update a step in a tutorial
// @access  Private (Creator only)
router.put('/:id/steps/:stepId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    screenshot,
    order,
    duration
  } = req.body;

  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the step
    const stepIndex = tutorial.steps.findIndex(step => step._id.toString() === req.params.stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({ msg: 'Step not found' });
    }
    
    // Update step
    tutorial.steps[stepIndex] = {
      ...tutorial.steps[stepIndex],
      title,
      description: description || tutorial.steps[stepIndex].description,
      screenshot: screenshot || tutorial.steps[stepIndex].screenshot,
      order: order || tutorial.steps[stepIndex].order,
      duration: duration || tutorial.steps[stepIndex].duration
    };
    
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tutorials/:id/steps/:stepId
// @desc    Delete a step from a tutorial
// @access  Private (Creator only)
router.delete('/:id/steps/:stepId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Check if user is the creator
    if (tutorial.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find and remove the step
    const stepIndex = tutorial.steps.findIndex(step => step._id.toString() === req.params.stepId);
    
    if (stepIndex === -1) {
      return res.status(404).json({ msg: 'Step not found' });
    }
    
    tutorial.steps.splice(stepIndex, 1);
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id/view
// @desc    Increment view count
// @access  Private
router.put('/:id/view', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Increment view count
    tutorial.viewCount += 1;
    await tutorial.save();

    res.json({ viewCount: tutorial.viewCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tutorials/:id/complete
// @desc    Increment completion count
// @access  Private
router.put('/:id/complete', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!tutorial) {
      return res.status(404).json({ msg: 'Tutorial not found' });
    }
    
    // Increment completion count
    tutorial.completionCount += 1;
    await tutorial.save();

    res.json({ completionCount: tutorial.completionCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;