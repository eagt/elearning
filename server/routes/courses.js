const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { auth, isCreator, isOwner } = require('../middleware/auth');
const { tenantMiddleware, tenantFilter, addTenantToBody } = require('../middleware/tenant');

// @route   POST api/courses
// @desc    Create a new course
// @access  Private (Creators only)
router.post('/', [
  auth,
  isCreator,
  tenantMiddleware,
  addTenantToBody,
  body('title', 'Course title is required').not().isEmpty(),
  body('description', 'Course description is required').not().isEmpty(),
  body('category', 'Course category is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, shortDescription, thumbnail, category, tags, difficulty, duration, price, currency, objectives, requirements, whatYouWillLearn, targetAudience, materials, faqs } = req.body;

  try {
    const course = new Course({
      title,
      description,
      shortDescription,
      thumbnail,
      category,
      tags,
      difficulty,
      duration,
      price,
      currency,
      objectives,
      requirements,
      whatYouWillLearn,
      targetAudience,
      materials,
      faqs,
      tenantId: req.tenantId,
      createdBy: req.user.id
    });

    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/courses
// @desc    Get all courses for a tenant
// @access  Private
router.get('/', [auth, tenantMiddleware, tenantFilter(Course)], async (req, res) => {
  try {
    const { category, difficulty, isPublished, isFeatured, search } = req.query;
    
    // Build query
    let query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('presentations')
      .populate('quizzes');
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if course belongs to the same tenant
    if (course.tenantId.toString() !== req.tenantId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id
// @desc    Update a course
// @access  Private (Course owner only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isOwner(Course),
  body('title', 'Course title is required').optional().not().isEmpty(),
  body('description', 'Course description is required').optional().not().isEmpty(),
  body('category', 'Course category is required').optional().not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, shortDescription, thumbnail, category, tags, difficulty, duration, price, currency, isPublished, isFeatured, objectives, requirements, whatYouWillLearn, targetAudience, materials, faqs } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Update course fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (shortDescription) course.shortDescription = shortDescription;
    if (thumbnail) course.thumbnail = thumbnail;
    if (category) course.category = category;
    if (tags) course.tags = tags;
    if (difficulty) course.difficulty = difficulty;
    if (duration !== undefined) course.duration = duration;
    if (price !== undefined) course.price = price;
    if (currency) course.currency = currency;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (isFeatured !== undefined) course.isFeatured = isFeatured;
    if (objectives) course.objectives = objectives;
    if (requirements) course.requirements = requirements;
    if (whatYouWillLearn) course.whatYouWillLearn = whatYouWillLearn;
    if (targetAudience) course.targetAudience = targetAudience;
    if (materials) course.materials = materials;
    if (faqs) course.faqs = faqs;

    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/courses/:id
// @desc    Delete a course
// @access  Private (Course owner only)
router.delete('/:id', [auth, tenantMiddleware, isOwner(Course)], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    await course.remove();

    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/publish
// @desc    Publish a course
// @access  Private (Course owner only)
router.put('/:id/publish', [auth, tenantMiddleware, isOwner(Course)], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    course.isPublished = true;
    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/unpublish
// @desc    Unpublish a course
// @access  Private (Course owner only)
router.put('/:id/unpublish', [auth, tenantMiddleware, isOwner(Course)], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    course.isPublished = false;
    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/feature
// @desc    Feature a course
// @access  Private (Creators only)
router.put('/:id/feature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if course belongs to the same tenant
    if (course.tenantId.toString() !== req.tenantId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    course.isFeatured = true;
    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/courses/:id/unfeature
// @desc    Unfeature a course
// @access  Private (Creators only)
router.put('/:id/unfeature', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Check if course belongs to the same tenant
    if (course.tenantId.toString() !== req.tenantId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    course.isFeatured = false;
    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/categories
// @desc    Get all course categories for a tenant
// @access  Private
router.get('/categories', [auth, tenantMiddleware], async (req, res) => {
  try {
    const categories = await Course.distinct('category', { tenantId: req.tenantId });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;