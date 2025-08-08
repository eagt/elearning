const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/tenants');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000 // 5MB limit
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

// Generate a unique slug from a name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// @route   GET api/tenants
// @desc    Get all tenants
// @access  Private (Admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json(tenants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tenants/me
// @desc    Get current user's tenant
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tenants/:id
// @desc    Get tenant by ID
// @access  Private
router.get('/:id', [auth], async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    // Check if user has access to this tenant
    if (req.user.role !== 'admin' && req.user.tenantId.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/tenants
// @desc    Create a tenant
// @access  Private (Admin only)
router.post('/', [
  auth,
  isAdmin,
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('adminEmail', 'Admin email is required').isEmail(),
  check('adminFirstName', 'Admin first name is required').not().isEmpty(),
  check('adminLastName', 'Admin last name is required').not().isEmpty(),
  check('adminPassword', 'Admin password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, 
    description, 
    website,
    adminEmail,
    adminFirstName,
    adminLastName,
    adminPassword,
    plan
  } = req.body;

  try {
    // Generate slug from name
    let slug = generateSlug(name);
    
    // Check if slug already exists
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      // Add random string to make it unique
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'Admin email already in use' });
    }

    // Create new tenant
    const tenant = new Tenant({
      name,
      slug,
      description,
      website: website || '',
      plan: plan || 'basic'
    });

    await tenant.save();

    // Create admin user for the tenant
    const adminUser = new User({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      tenantId: tenant._id
    });

    await adminUser.save();

    res.json({ tenant, adminUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tenants/:id
// @desc    Update a tenant
// @access  Private (Admin or Tenant Admin)
router.put('/:id', [
  auth,
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, website, settings } = req.body;

  try {
    let tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    // Check if user has permission to update this tenant
    if (req.user.role !== 'admin' && req.user.tenantId.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Generate new slug if name changed
    let slug = tenant.slug;
    if (name !== tenant.name) {
      slug = generateSlug(name);
      
      // Check if slug already exists
      const existingTenant = await Tenant.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingTenant) {
        // Add random string to make it unique
        slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
      }
    }
    
    // Update tenant
    tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { 
        $set: {
          name,
          slug,
          description,
          website: website || '',
          settings: settings || tenant.settings
        }
      },
      { new: true }
    );
    
    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tenants/:id/logo
// @desc    Upload tenant logo
// @access  Private (Admin or Tenant Admin)
router.put('/:id/logo', [auth, upload.single('logo')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    let tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    // Check if user has permission to update this tenant
    if (req.user.role !== 'admin' && req.user.tenantId.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Update tenant logo
    tenant.logo = `/uploads/tenants/${req.file.filename}`;
    await tenant.save();

    res.json({ logo: tenant.logo });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tenants/:id/subscription
// @desc    Update tenant subscription
// @access  Private (Admin only)
router.put('/:id/subscription', [
  auth,
  isAdmin,
  check('plan', 'Plan is required').not().isEmpty(),
  check('status', 'Status is required').isIn(['active', 'cancelled', 'expired']),
  check('startDate', 'Start date is required').not().isEmpty(),
  check('endDate', 'End date is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { plan, status, startDate, endDate } = req.body;

  try {
    let tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    // Update tenant subscription
    tenant.subscription = {
      plan,
      status,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
    
    await tenant.save();

    res.json(tenant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tenants/:id
// @desc    Delete a tenant
// @access  Private (Admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ msg: 'Tenant not found' });
    }
    
    // Delete all users associated with this tenant
    await User.deleteMany({ tenantId: req.params.id });
    
    // Delete the tenant
    await Tenant.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Tenant removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tenants/:id/users
// @desc    Get all users for a tenant
// @access  Private (Admin or Tenant Admin)
router.get('/:id/users', [auth], async (req, res) => {
  try {
    // Check if user has access to this tenant
    if (req.user.role !== 'admin' && req.user.tenantId.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const users = await User.find({ tenantId: req.params.id })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tenants/:id/stats
// @desc    Get tenant statistics
// @access  Private (Admin or Tenant Admin)
router.get('/:id/stats', [auth], async (req, res) => {
  try {
    // Check if user has access to this tenant
    if (req.user.role !== 'admin' && req.user.tenantId.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const userCount = await User.countDocuments({ tenantId: req.params.id });
    
    const stats = {
      userCount,
      // Add more stats as needed
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;