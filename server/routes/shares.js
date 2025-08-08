const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator, isCreatorOrLearner } = require('../middleware/auth');
const Share = require('../models/Share');
const User = require('../models/User');
const Course = require('../models/Course');
const Presentation = require('../models/Presentation');
const Quiz = require('../models/Quiz');
const Tutorial = require('../models/Tutorial');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// @route   POST api/shares
// @desc    Share content
// @access  Private (Creator only)
router.post('/', [
  auth,
  tenantMiddleware,
  isCreator,
  check('contentId', 'Content ID is required').not().isEmpty(),
  check('contentType', 'Content type is required').isIn(['Course', 'Presentation', 'Quiz', 'Tutorial']),
  check('shareType', 'Share type is required').isIn(['link', 'email', 'user', 'group', 'public']),
  check('permissions.canView', 'View permission is required').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    contentId,
    contentType,
    shareType,
    recipients,
    permissions,
    settings
  } = req.body;

  try {
    // Verify content exists and belongs to the tenant
    let content;
    
    switch (contentType) {
      case 'Course':
        content = await Course.findOne({ _id: contentId, tenantId: req.tenantId });
        break;
      case 'Presentation':
        content = await Presentation.findOne({ _id: contentId, tenantId: req.tenantId });
        break;
      case 'Quiz':
        content = await Quiz.findOne({ _id: contentId, tenantId: req.tenantId });
        break;
      case 'Tutorial':
        content = await Tutorial.findOne({ _id: contentId, tenantId: req.tenantId });
        break;
    }
    
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }
    
    // Check if user is the creator of the content
    if (content.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create new share
    const share = new Share({
      contentId,
      contentType,
      sharedBy: req.user.id,
      tenantId: req.tenantId,
      shareType,
      recipients: recipients || [],
      permissions: permissions || { canView: true },
      settings: settings || {}
    });
    
    await share.save();
    
    // If share type is email, send emails to recipients
    if (shareType === 'email' && recipients && recipients.length > 0) {
      // In a real implementation, you would set up nodemailer with your email service
      // For now, we'll just log that emails would be sent
      console.log(`Sending share emails to: ${recipients.join(', ')}`);
      
      // Example email sending code (commented out):
      /*
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      for (const recipient of recipients) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient,
          subject: `Content shared with you: ${content.title}`,
          html: `
            <h2>Content Shared With You</h2>
            <p>${req.user.firstName} ${req.user.lastName} has shared "${content.title}" with you.</p>
            <p><a href="${process.env.CLIENT_URL}/shared/${share.shareToken}">View Content</a></p>
            <p>This link will expire on ${share.settings.expirationDate ? new Date(share.settings.expirationDate).toLocaleDateString() : 'never'}.</p>
          `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      }
      */
    }
    
    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/shares
// @desc    Get all shares for a tenant
// @access  Private (Creator only)
router.get('/', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', shareType } = req.query;
    
    const query = { tenantId: req.tenantId };
    
    if (shareType) {
      query.shareType = shareType;
    }
    
    const skip = (page - 1) * limit;
    
    const shares = await Share.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sharedBy', 'firstName lastName email')
      .populate('contentId');
    
    const total = await Share.countDocuments(query);
    
    res.json({
      shares,
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

// @route   GET api/shares/:id
// @desc    Get share by ID
// @access  Private (Creator only)
router.get('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('sharedBy', 'firstName lastName email')
      .populate('contentId');
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user is the one who shared the content
    if (share.sharedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/shares/token/:token
// @desc    Get share by token
// @access  Public
router.get('/token/:token', async (req, res) => {
  try {
    const share = await Share.findByToken(req.params.token)
      .populate('contentId')
      .populate('sharedBy', 'firstName lastName');
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if share is expired
    if (share.isExpired()) {
      return res.status(410).json({ msg: 'Share has expired' });
    }
    
    // Check if share requires login
    if (share.settings.requireLogin && !req.user) {
      return res.status(401).json({ msg: 'Login required', requiresLogin: true });
    }
    
    // Record view
    await share.recordView(req.user ? req.user.id : null);
    
    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/shares/:id
// @desc    Update a share
// @access  Private (Creator only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  isCreator,
  check('permissions.canView', 'View permission is required').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    recipients,
    permissions,
    settings
  } = req.body;

  try {
    let share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user is the one who shared the content
    if (share.sharedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build share object
    const shareFields = {};
    if (recipients) shareFields.recipients = recipients;
    if (permissions) shareFields.permissions = permissions;
    if (settings) shareFields.settings = settings;
    
    // Update share
    share = await Share.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: shareFields },
      { new: true }
    ).populate('sharedBy', 'firstName lastName email')
      .populate('contentId');
    
    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/shares/:id
// @desc    Delete a share
// @access  Private (Creator only)
router.delete('/:id', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user is the one who shared the content
    if (share.sharedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Delete share
    await Share.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Share removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/shares/:id/toggle
// @desc    Toggle share active status
// @access  Private (Creator only)
router.put('/:id/toggle', [auth, tenantMiddleware, isCreator], async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user is the one who shared the content
    if (share.sharedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Toggle active status
    share.isActive = !share.isActive;
    await share.save();

    res.json(share);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/shares/:id/comments
// @desc    Add a comment to a share
// @access  Private
router.post('/:id/comments', [
  auth,
  tenantMiddleware,
  check('text', 'Comment text is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { text } = req.body;

  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user has permission to comment
    if (!share.hasPermission('canComment', req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Add comment
    await share.addComment(req.user.id, text);
    
    res.json({ msg: 'Comment added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/shares/:id/comments/:commentIndex/replies
// @desc    Add a reply to a comment
// @access  Private
router.post('/:id/comments/:commentIndex/replies', [
  auth,
  tenantMiddleware,
  check('text', 'Reply text is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { text } = req.body;
  const commentIndex = parseInt(req.params.commentIndex);

  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user has permission to comment
    if (!share.hasPermission('canComment', req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Add reply
    await share.addReply(commentIndex, req.user.id, text);
    
    res.json({ msg: 'Reply added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/shares/:id/download
// @desc    Record a download
// @access  Private
router.put('/:id/download', [auth, tenantMiddleware], async (req, res) => {
  try {
    const share = await Share.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!share) {
      return res.status(404).json({ msg: 'Share not found' });
    }
    
    // Check if user has permission to download
    if (!share.hasPermission('canDownload', req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Record download
    await share.recordDownload();
    
    res.json({ msg: 'Download recorded' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;