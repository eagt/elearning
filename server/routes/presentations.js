const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Presentation = require('../models/Presentation');
const User = require('../models/User');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/presentations');
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

// @route   GET api/presentations
// @desc    Get all presentations for a tenant
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
    
    const presentations = await Presentation.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug');
    
    const total = await Presentation.countDocuments(query);
    
    res.json({
      presentations,
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

// @route   GET api/presentations/:id
// @desc    Get presentation by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('courses', 'title');
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/presentations
// @desc    Create a presentation
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
    settings,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses
  } = req.body;

  try {
    // Create new presentation
    const presentation = new Presentation({
      title,
      description,
      shortDescription: shortDescription || '',
      thumbnail: req.file ? `/uploads/presentations/${req.file.filename}` : 'default-presentation-thumbnail.jpg',
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
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
      courses: courses || []
    });

    await presentation.save();

    // If courses are specified, add presentation to those courses
    if (courses && courses.length > 0) {
      await Course.updateMany(
        { _id: { $in: courses }, tenantId: req.tenantId },
        { $push: { presentations: presentation._id } }
      );
    }

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id
// @desc    Update a presentation
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
    slides,
    branchingScenarios,
    settings,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses
  } = req.body;

  try {
    let presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build presentation object
    const presentationFields = {};
    if (title) presentationFields.title = title;
    if (description) presentationFields.description = description;
    if (shortDescription) presentationFields.shortDescription = shortDescription;
    if (req.file) presentationFields.thumbnail = `/uploads/presentations/${req.file.filename}`;
    if (category) presentationFields.category = category;
    if (tags) presentationFields.tags = tags.split(',').map(tag => tag.trim());
    if (slides) presentationFields.slides = slides;
    if (branchingScenarios) presentationFields.branchingScenarios = branchingScenarios;
    if (settings) presentationFields.settings = settings;
    if (typeof isPublished !== 'undefined') presentationFields.isPublished = isPublished;
    if (typeof isFeatured !== 'undefined') presentationFields.isFeatured = isFeatured;
    if (estimatedTime) presentationFields.estimatedTime = estimatedTime;
    if (difficulty) presentationFields.difficulty = difficulty;
    if (prerequisites) presentationFields.prerequisites = prerequisites;
    if (learningObjectives) presentationFields.learningObjectives = learningObjectives;
    if (targetAudience) presentationFields.targetAudience = targetAudience;
    if (courses) presentationFields.courses = courses;
    
    // Update presentation
    presentation = await Presentation.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: presentationFields },
      { new: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('tenantId', 'name slug')
      .populate('courses', 'title');
    
    // Update courses if changed
    if (courses) {
      // Remove presentation from courses that are no longer selected
      await Course.updateMany(
        { presentations: req.params.id, _id: { $nin: courses }, tenantId: req.tenantId },
        { $pull: { presentations: req.params.id } }
      );
      
      // Add presentation to new courses
      await Course.updateMany(
        { _id: { $in: courses }, presentations: { $ne: req.params.id }, tenantId: req.tenantId },
        { $push: { presentations: req.params.id } }
      );
    }
    
    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/presentations/:id
// @desc    Delete a presentation
// @access  Private (Creator only)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Remove presentation from courses
    await Course.updateMany(
      { presentations: req.params.id, tenantId: req.tenantId },
      { $pull: { presentations: req.params.id } }
    );
    
    // Delete presentation
    await Presentation.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Presentation removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/publish
// @desc    Publish/unpublish a presentation
// @access  Private (Creator only)
router.put('/:id/publish', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle publish status
    presentation.isPublished = !presentation.isPublished;
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/feature
// @desc    Feature/unfeature a presentation
// @access  Private (Admin or Creator)
router.put('/:id/feature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator or admin
    if (presentation.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle feature status
    presentation.isFeatured = !presentation.isFeatured;
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/presentations/:id/slides
// @desc    Add a slide to a presentation
// @access  Private (Creator only)
router.post('/:id/slides', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty(),
  check('order', 'Order is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    content,
    backgroundImage,
    backgroundColor,
    textColor,
    layout,
    order,
    media,
    notes,
    animation,
    transition,
    duration
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new slide
    const slide = {
      title,
      content,
      backgroundImage: backgroundImage || '',
      backgroundColor: backgroundColor || '#FFFFFF',
      textColor: textColor || '#212121',
      layout: layout || 'content',
      order,
      media: media || [],
      notes: notes || '',
      animation: animation || 'fade',
      transition: transition || 'fade',
      duration: duration || 0
    };
    
    // Add slide to presentation
    presentation.slides.push(slide);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/slides/:slideId
// @desc    Update a slide in a presentation
// @access  Private (Creator only)
router.put('/:id/slides/:slideId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    content,
    backgroundImage,
    backgroundColor,
    textColor,
    layout,
    media,
    notes,
    animation,
    transition,
    duration
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the slide
    const slideIndex = presentation.slides.findIndex(slide => slide._id.toString() === req.params.slideId);
    
    if (slideIndex === -1) {
      return res.status(404).json({ msg: 'Slide not found' });
    }
    
    // Update slide
    presentation.slides[slideIndex] = {
      ...presentation.slides[slideIndex],
      title,
      content,
      backgroundImage: backgroundImage || presentation.slides[slideIndex].backgroundImage,
      backgroundColor: backgroundColor || presentation.slides[slideIndex].backgroundColor,
      textColor: textColor || presentation.slides[slideIndex].textColor,
      layout: layout || presentation.slides[slideIndex].layout,
      media: media || presentation.slides[slideIndex].media,
      notes: notes || presentation.slides[slideIndex].notes,
      animation: animation || presentation.slides[slideIndex].animation,
      transition: transition || presentation.slides[slideIndex].transition,
      duration: duration || presentation.slides[slideIndex].duration
    };
    
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/presentations/:id/slides/:slideId
// @desc    Delete a slide from a presentation
// @access  Private (Creator only)
router.delete('/:id/slides/:slideId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find and remove the slide
    const slideIndex = presentation.slides.findIndex(slide => slide._id.toString() === req.params.slideId);
    
    if (slideIndex === -1) {
      return res.status(404).json({ msg: 'Slide not found' });
    }
    
    presentation.slides.splice(slideIndex, 1);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/presentations/:id/slides/:slideId/hotspots
// @desc    Add a hotspot to a slide
// @access  Private (Creator only)
router.post('/:id/slides/:slideId/hotspots', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty(),
  check('type', 'Type is required').isIn(['info', 'link', 'branch', 'media', 'quiz']),
  check('position.x', 'X position is required').isNumeric(),
  check('position.y', 'Y position is required').isNumeric(),
  check('action.type', 'Action type is required').isIn(['popup', 'navigate', 'open-link', 'play-media', 'start-quiz'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    type,
    position,
    size,
    shape,
    style,
    action,
    isActive,
    order
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the slide
    const slideIndex = presentation.slides.findIndex(slide => slide._id.toString() === req.params.slideId);
    
    if (slideIndex === -1) {
      return res.status(404).json({ msg: 'Slide not found' });
    }
    
    // Create new hotspot
    const hotspot = {
      title,
      description: description || '',
      type,
      position,
      size: size || { width: 20, height: 20 },
      shape: shape || 'rectangle',
      style: style || {
        backgroundColor: 'rgba(0, 172, 193, 0.7)',
        borderColor: '#00ACC1',
        borderWidth: 2,
        textColor: '#FFFFFF',
        icon: 'info'
      },
      action,
      isActive: isActive !== undefined ? isActive : true,
      order
    };
    
    // Add hotspot to slide
    presentation.slides[slideIndex].hotspots.push(hotspot);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/slides/:slideId/hotspots/:hotspotId
// @desc    Update a hotspot in a slide
// @access  Private (Creator only)
router.put('/:id/slides/:slideId/hotspots/:hotspotId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('title', 'Title is required').not().isEmpty(),
  check('type', 'Type is required').isIn(['info', 'link', 'branch', 'media', 'quiz']),
  check('position.x', 'X position is required').isNumeric(),
  check('position.y', 'Y position is required').isNumeric(),
  check('action.type', 'Action type is required').isIn(['popup', 'navigate', 'open-link', 'play-media', 'start-quiz'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    type,
    position,
    size,
    shape,
    style,
    action,
    isActive,
    order
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the slide
    const slideIndex = presentation.slides.findIndex(slide => slide._id.toString() === req.params.slideId);
    
    if (slideIndex === -1) {
      return res.status(404).json({ msg: 'Slide not found' });
    }
    
    // Find the hotspot
    const hotspotIndex = presentation.slides[slideIndex].hotspots.findIndex(hotspot => hotspot._id.toString() === req.params.hotspotId);
    
    if (hotspotIndex === -1) {
      return res.status(404).json({ msg: 'Hotspot not found' });
    }
    
    // Update hotspot
    presentation.slides[slideIndex].hotspots[hotspotIndex] = {
      ...presentation.slides[slideIndex].hotspots[hotspotIndex],
      title,
      description: description || presentation.slides[slideIndex].hotspots[hotspotIndex].description,
      type,
      position,
      size: size || presentation.slides[slideIndex].hotspots[hotspotIndex].size,
      shape: shape || presentation.slides[slideIndex].hotspots[hotspotIndex].shape,
      style: style || presentation.slides[slideIndex].hotspots[hotspotIndex].style,
      action,
      isActive: isActive !== undefined ? isActive : presentation.slides[slideIndex].hotspots[hotspotIndex].isActive,
      order: order || presentation.slides[slideIndex].hotspots[hotspotIndex].order
    };
    
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/presentations/:id/slides/:slideId/hotspots/:hotspotId
// @desc    Delete a hotspot from a slide
// @access  Private (Creator only)
router.delete('/:id/slides/:slideId/hotspots/:hotspotId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the slide
    const slideIndex = presentation.slides.findIndex(slide => slide._id.toString() === req.params.slideId);
    
    if (slideIndex === -1) {
      return res.status(404).json({ msg: 'Slide not found' });
    }
    
    // Find and remove the hotspot
    const hotspotIndex = presentation.slides[slideIndex].hotspots.findIndex(hotspot => hotspot._id.toString() === req.params.hotspotId);
    
    if (hotspotIndex === -1) {
      return res.status(404).json({ msg: 'Hotspot not found' });
    }
    
    presentation.slides[slideIndex].hotspots.splice(hotspotIndex, 1);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/presentations/:id/branching-scenarios
// @desc    Add a branching scenario to a presentation
// @access  Private (Creator only)
router.post('/:id/branching-scenarios', [
  auth,
  tenantMiddleware,
  isCreator,
  check('name', 'Name is required').not().isEmpty(),
  check('startSlideId', 'Start slide ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    startSlideId,
    endSlideIds,
    conditions,
    isDefault,
    isActive
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new branching scenario
    const branchingScenario = {
      name,
      description: description || '',
      startSlideId,
      endSlideIds: endSlideIds || [],
      conditions: conditions || [],
      isDefault: isDefault || false,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Add branching scenario to presentation
    presentation.branchingScenarios.push(branchingScenario);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/branching-scenarios/:scenarioId
// @desc    Update a branching scenario in a presentation
// @access  Private (Creator only)
router.put('/:id/branching-scenarios/:scenarioId', [
  auth,
  tenantMiddleware,
  isCreator,
  check('name', 'Name is required').not().isEmpty(),
  check('startSlideId', 'Start slide ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    startSlideId,
    endSlideIds,
    conditions,
    isDefault,
    isActive
  } = req.body;

  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find the branching scenario
    const scenarioIndex = presentation.branchingScenarios.findIndex(scenario => scenario._id.toString() === req.params.scenarioId);
    
    if (scenarioIndex === -1) {
      return res.status(404).json({ msg: 'Branching scenario not found' });
    }
    
    // Update branching scenario
    presentation.branchingScenarios[scenarioIndex] = {
      ...presentation.branchingScenarios[scenarioIndex],
      name,
      description: description || presentation.branchingScenarios[scenarioIndex].description,
      startSlideId,
      endSlideIds: endSlideIds || presentation.branchingScenarios[scenarioIndex].endSlideIds,
      conditions: conditions || presentation.branchingScenarios[scenarioIndex].conditions,
      isDefault: isDefault !== undefined ? isDefault : presentation.branchingScenarios[scenarioIndex].isDefault,
      isActive: isActive !== undefined ? isActive : presentation.branchingScenarios[scenarioIndex].isActive
    };
    
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/presentations/:id/branching-scenarios/:scenarioId
// @desc    Delete a branching scenario from a presentation
// @access  Private (Creator only)
router.delete('/:id/branching-scenarios/:scenarioId', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Check if user is the creator
    if (presentation.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find and remove the branching scenario
    const scenarioIndex = presentation.branchingScenarios.findIndex(scenario => scenario._id.toString() === req.params.scenarioId);
    
    if (scenarioIndex === -1) {
      return res.status(404).json({ msg: 'Branching scenario not found' });
    }
    
    presentation.branchingScenarios.splice(scenarioIndex, 1);
    await presentation.save();

    res.json(presentation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/view
// @desc    Increment view count
// @access  Private
router.put('/:id/view', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Increment view count
    presentation.viewCount += 1;
    await presentation.save();

    res.json({ viewCount: presentation.viewCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/presentations/:id/complete
// @desc    Increment completion count
// @access  Private
router.put('/:id/complete', [auth, tenantMiddleware, isCreatorOrLearner], async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!presentation) {
      return res.status(404).json({ msg: 'Presentation not found' });
    }
    
    // Increment completion count
    presentation.completionCount += 1;
    await presentation.save();

    res.json({ completionCount: presentation.completionCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;