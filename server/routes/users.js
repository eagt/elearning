const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isLearner, isCreatorOrLearner } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
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
    fileSize: 1000000 // 1MB limit
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
    cb('Error: Images Only!');
  }
}

// @route   GET api/users
// @desc    Get all users for a tenant
// @access  Private
router.get('/', [auth, tenantMiddleware], async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.tenantId })
      .select('-password')
      .populate('tenantId', 'name slug');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('tenantId', 'name slug');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .select('-password')
      .populate('tenantId', 'name slug');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user
// @access  Private
router.put('/me', [
  auth,
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, bio } = req.body;

  // Build user object
  const userFields = {};
  if (firstName) userFields.firstName = firstName;
  if (lastName) userFields.lastName = lastName;
  if (email) userFields.email = email;
  if (bio) userFields.bio = bio;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me/avatar
// @desc    Upload user avatar
// @access  Private
router.put('/me/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private (Admin or Creator)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isCreator,
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('role', 'Role is required').isIn(['creator', 'learner', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, role, bio, isActive } = req.body;

  // Build user object
  const userFields = {};
  if (firstName) userFields.firstName = firstName;
  if (lastName) userFields.lastName = lastName;
  if (email) userFields.email = email;
  if (role) userFields.role = role;
  if (bio) userFields.bio = bio;
  if (typeof isActive !== 'undefined') userFields.isActive = isActive;

  try {
    let user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id },
        tenantId: req.tenantId
      });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    // Update user
    user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private (Admin or Creator)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is trying to delete themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    await User.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id/role
// @desc    Update user role
// @access  Private (Admin or Creator)
router.put('/:id/role', [
  auth,
  tenantMiddleware,
  isCreator,
  check('role', 'Role is required').isIn(['creator', 'learner', 'admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { role } = req.body;

  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is trying to change their own role
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot change your own role' });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id/status
// @desc    Update user status (active/inactive)
// @access  Private (Admin or Creator)
router.put('/:id/status', [
  auth,
  tenantMiddleware,
  isCreator,
  check('isActive', 'Status is required').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { isActive } = req.body;

  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if user is trying to deactivate themselves
    if (req.params.id === req.user.id && !isActive) {
      return res.status(400).json({ msg: 'Cannot deactivate your own account' });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;