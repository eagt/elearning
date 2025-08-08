const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Screenshot = require('../models/Screenshot');
const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/screenshots');
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

// @route   GET api/screenshots
// @desc    Get all screenshots for a tenant
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
    
    const screenshots = await Screenshot.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug');
    
    const total = await Screenshot.countDocuments(query);
    
    res.json({
      screenshots,
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

// @route   GET api/screenshots/:id
// @desc    Get screenshot by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('tutorials', 'title');
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/screenshots
// @desc    Create a screenshot
// @access  Private (Creator only)
router.post('/', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('image'),
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    tags,
    category,
    difficulty,
    estimatedTime,
    isPublished,
    isFeatured,
    tutorials
  } = req.body;

  try {
    // Create new screenshot
    const screenshot = new Screenshot({
      title,
      description: description || '',
      imageUrl: `/uploads/screenshots/${req.file.filename}`,
      thumbnailUrl: `/uploads/screenshots/${req.file.filename}`, // In a real app, you'd generate a thumbnail
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || 1,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      tenantId: req.tenantId,
      createdBy: req.user.id,
      tutorials: tutorials || []
    });

    await screenshot.save();

    // If tutorials are specified, add screenshot to those tutorials
    if (tutorials && tutorials.length > 0) {
      await Tutorial.updateMany(
        { _id: { $in: tutorials }, tenantId: req.tenantId },
        { $push: { screenshots: screenshot._id } }
      );
    }

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/screenshots/:id
// @desc    Update a screenshot
// @access  Private (Creator only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isCreator,
  upload.single('image'),
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    tags,
    annotations,
    category,
    difficulty,
    estimatedTime,
    isPublished,
    isFeatured,
    tutorials
  } = req.body;

  try {
    let screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build screenshot object
    const screenshotFields = {};
    if (title) screenshotFields.title = title;
    if (description) screenshotFields.description = description;
    if (req.file) {
      screenshotFields.imageUrl = `/uploads/screenshots/${req.file.filename}`;
      screenshotFields.thumbnailUrl = `/uploads/screenshots/${req.file.filename}`;
    }
    if (tags) screenshotFields.tags = tags.split(',').map(tag => tag.trim());
    if (annotations) screenshotFields.annotations = annotations;
    if (category) screenshotFields.category = category;
    if (difficulty) screenshotFields.difficulty = difficulty;
    if (estimatedTime) screenshotFields.estimatedTime = estimatedTime;
    if (typeof isPublished !== 'undefined') screenshotFields.isPublished = isPublished;
    if (typeof isFeatured !== 'undefined') screenshotFields.isFeatured = isFeatured;
    if (tutorials) screenshotFields.tutorials = tutorials;
    
    // Update screenshot
    screenshot = await Screenshot.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: screenshotFields },
      { new: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('tutorials', 'title');
    
    // Update tutorials if changed
    if (tutorials) {
      // Remove screenshot from tutorials that are no longer selected
      await Tutorial.updateMany(
        { screenshots: req.params.id, _id: { $nin: tutorials }, tenantId: req.tenantId },
        { $pull: { screenshots: req.params.id } }
      );
      
      // Add screenshot to new tutorials
      await Tutorial.updateMany(
        { _id: { $in: tutorials }, screenshots: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { screenshots: req.params.id } }
      );
    }
    
    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/screenshots/:id
// @desc    Delete a screenshot
// @access  Private (Creator only)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Remove screenshot from tutorials
    await Tutorial.updateMany(
      { screenshots: req.params.id, tenantId: req.tenantId },
      { $pull: { screenshots: req.params.id } }
    );
    
    // Delete screenshot
    await Screenshot.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Screenshot removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/screenshots/:id/publish
// @desc    Publish/unpublish a screenshot
// @access  Private (Creator only)
router.put('/:id/publish', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle publish status
    screenshot.isPublished = !screenshot.isPublished;
    await screenshot.save();

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/screenshots/:id/feature
// @desc    Feature/unfeature a screenshot
// @access  Private (Admin or Creator)
router.put('/:id/feature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator or admin
    if (screenshot.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle feature status
    screenshot.isFeatured = !screenshot.isFeatured;
    await screenshot.save();

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/screenshots/:id/annotations
// @desc    Add an annotation to a screenshot
// @access  Private (Creator only)
router.post('/:id/annotations', [
  auth,
  tenantMiddleware,
  isCreator,
  check('type', 'Type is required').isIn(['rectangle', 'circle', 'arrow', 'text', 'highlight']),
  check('x', 'X position is required').isNumeric(),
  check('y', 'Y position is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    type,
    x,
    y,
    width,
    height,
    text,
    color,
    fontSize,
    strokeWidth,
    order
  } = req.body;

  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new annotation
    const annotation = {
      type,
      x,
      y,
      width: width || 0,
      height: height || 0,
      text: text || '',
      color: color || '#FF0000',
      fontSize: fontSize || 16,
      strokeWidth: strokeWidth || 2,
      order: order || screenshot.annotations.length
    };
    
    // Add annotation to screenshot
    screenshot.annotations.push(annotation);
    await screenshot.save();

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/screenshots/:id/annotations/:annotationId
// @desc    Update an annotation in a screenshot
// @access  Private (Creator only)
router.put('/:id/annotations/:annotationId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('type', 'Type is required').isIn(['rectangle', 'circle', 'arrow', 'text', 'highlight']),
  check('x', 'X position is required').isNumeric(),
  check('y', 'Y position is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    type,
    x,
    y,
    width,
    height,
    text,
    color,
    fontSize,
    strokeWidth,
    order
  } = req.body;

  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the annotation
    const annotationIndex = screenshot.annotations.findIndex(annotation => annotation._id.toString() === req.params.annotationId);
    
    if (annotationIndex === -1) {
      return res.status(404).json({ msg: 'Annotation not found' });
    }
    
    // Update annotation
    screenshot.annotations[annotationIndex] = {
      ...screenshot.annotations[annotationIndex],
      type,
      x,
      y,
      width: width || screenshot.annotations[annotationIndex].width,
      height: height || screenshot.annotations[annotationIndex].height,
      text: text || screenshot.annotations[annotationIndex].text,
      color: color || screenshot.annotations[annotationIndex].color,
      fontSize: fontSize || screenshot.annotations[annotationIndex].fontSize,
      strokeWidth: strokeWidth || screenshot.annotations[annotationIndex].strokeWidth,
      order: order || screenshot.annotations[annotationIndex].order
    };
    
    await screenshot.save();

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/screenshots/:id/annotations/:annotationId
// @desc    Delete an annotation from a screenshot
// @access  Private (Creator only)
router.delete('/:id/annotations/:annotationId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Check if user is the creator
    if (screenshot.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find and remove the annotation
    const annotationIndex = screenshot.annotations.findIndex(annotation => annotation._id.toString() === req.params.annotationId);
    
    if (annotationIndex === -1) {
      return res.status(404).json({ msg: 'Annotation not found' });
    }
    
    screenshot.annotations.splice(annotationIndex, 1);
    await screenshot.save();

    res.json(screenshot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/screenshots/:id/view
// @desc    Increment view count
// @access  Private
router.put('/:id/view', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const screenshot = await Screenshot.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!screenshot) {
      return res.status(404).json({ msg: 'Screenshot not found' });
    }
    
    // Increment view count
    screenshot.viewCount += 1;
    await screenshot.save();

    res.json({ viewCount: screenshot.viewCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
