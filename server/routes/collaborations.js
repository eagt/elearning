const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenant');
const { isCreator } = require('../middleware/auth');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const Course = require('../models/Course');
const Presentation = require('../models/Presentation');
const Quiz = require('../models/Quiz');
const Tutorial = require('../models/Tutorial');

// @route   POST api/collaborations
// @desc    Create a collaboration
// @access  Private (Creator only)
router.post('/', [
  auth,
  tenantMiddleware,
  isCreator,
  check('contentId', 'Content ID is required').not().isEmpty(),
  check('contentType', 'Content type is required').isIn(['Course', 'Presentation', 'Quiz', 'Tutorial'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    contentId,
    contentType,
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
    
    // Check if collaboration already exists for this content
    const existingCollaboration = await Collaboration.findOne({
      contentId,
      contentType,
      tenantId: req.tenantId
    });
    
    if (existingCollaboration) {
      return res.status(400).json({ msg: 'Collaboration already exists for this content' });
    }
    
    // Create new collaboration
    const collaboration = new Collaboration({
      contentId,
      contentType,
      tenantId: req.tenantId,
      ownerId: req.user.id,
      settings: settings || {}
    });
    
    await collaboration.save();
    
    // Add initial version
    await collaboration.createVersion(
      req.user.id,
      'Initial version',
      content.toObject()
    );
    
    res.json(collaboration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/collaborations
// @desc    Get all collaborations for a user
// @access  Private
router.get('/', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaborations = await Collaboration.findByUser(req.user.id);
    
    // Filter by tenant
    const tenantCollaborations = collaborations.filter(
      collab => collab.tenantId.toString() === req.tenantId
    );
    
    res.json(tenantCollaborations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/collaborations/:id
// @desc    Get collaboration by ID
// @access  Private
router.get('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('ownerId', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email')
      .populate('contentId')
      .populate('comments.userId', 'firstName lastName')
      .populate('comments.replies.userId', 'firstName lastName')
      .populate('tasks.assignedTo', 'firstName lastName')
      .populate('tasks.assignedBy', 'firstName lastName')
      .populate('timeline.userId', 'firstName lastName')
      .populate('versions.userId', 'firstName lastName');
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is a member or owner
    if (!collaboration.isOwner(req.user.id) && !collaboration.isMember(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(collaboration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/collaborations/:id
// @desc    Update collaboration settings
// @access  Private (Owner only)
router.put('/:id', [
  auth,
  tenantMiddleware,
  check('status', 'Status is required').isIn(['active', 'paused', 'completed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    status,
    settings
  } = req.body;

  try {
    let collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the owner
    if (!collaboration.isOwner(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build collaboration object
    const collaborationFields = {};
    if (status) collaborationFields.status = status;
    if (settings) collaborationFields.settings = settings;
    
    // Update collaboration
    collaboration = await Collaboration.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $set: collaborationFields },
      { new: true }
    ).populate('ownerId', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email')
      .populate('contentId');
    
    // Add to timeline
    collaboration.timeline.push({
      action: 'settings_updated',
      userId: req.user.id,
      details: { status, settings }
    });
    
    await collaboration.save();
    
    res.json(collaboration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/collaborations/:id
// @desc    Delete a collaboration
// @access  Private (Owner only)
router.delete('/:id', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the owner
    if (!collaboration.isOwner(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Delete collaboration
    await Collaboration.findOneAndRemove({ _id: req.params.id, tenantId: req.tenantId });

    res.json({ msg: 'Collaboration removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/collaborations/:id/members
// @desc    Add a member to the collaboration
// @access  Private (Owner only)
router.post('/:id/members', [
  auth,
  tenantMiddleware,
  check('userId', 'User ID is required').not().isEmpty(),
  check('role', 'Role is required').isIn(['editor', 'reviewer', 'commenter'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    userId,
    role,
    permissions
  } = req.body;

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the owner
    if (!collaboration.isOwner(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Check if user exists
    const user = await User.findOne({ _id: userId, tenantId: req.tenantId });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Add member
    await collaboration.addMember(userId, role, permissions || {});
    
    res.json({ msg: 'Member added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/collaborations/:id/members/:userId/accept
// @desc    Accept a collaboration invitation
// @access  Private
router.put('/:id/members/:userId/accept', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the one being invited
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Accept invitation
    await collaboration.acceptInvitation(req.user.id);
    
    res.json({ msg: 'Invitation accepted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/collaborations/:id/members/:userId/decline
// @desc    Decline a collaboration invitation
// @access  Private
router.put('/:id/members/:userId/decline', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the one being invited
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Decline invitation
    await collaboration.declineInvitation(req.user.id);
    
    res.json({ msg: 'Invitation declined' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/collaborations/:id/members/:userId
// @desc    Remove a member from the collaboration
// @access  Private (Owner only)
router.delete('/:id/members/:userId', [auth, tenantMiddleware], async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user is the owner
    if (!collaboration.isOwner(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Remove member
    await collaboration.removeMember(req.params.userId, req.user.id);
    
    res.json({ msg: 'Member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/collaborations/:id/comments
// @desc    Add a comment to the collaboration
// @access  Private (Members only)
router.post('/:id/comments', [
  auth,
  tenantMiddleware,
  check('text', 'Comment text is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    text,
    position
  } = req.body;

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user has permission to comment
    if (!collaboration.hasPermission(req.user.id, 'canComment')) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Add comment
    await collaboration.addComment(req.user.id, text, position);
    
    res.json({ msg: 'Comment added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/collaborations/:id/comments/:commentIndex/replies
// @desc    Add a reply to a comment
// @access  Private (Members only)
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
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user has permission to comment
    if (!collaboration.hasPermission(req.user.id, 'canComment')) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Add reply
    await collaboration.addReply(commentIndex, req.user.id, text);
    
    res.json({ msg: 'Reply added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/collaborations/:id/comments/:commentIndex/resolve
// @desc    Resolve a comment
// @access  Private (Members only)
router.put('/:id/comments/:commentIndex/resolve', [auth, tenantMiddleware], async (req, res) => {
  const commentIndex = parseInt(req.params.commentIndex);

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user has permission to comment
    if (!collaboration.hasPermission(req.user.id, 'canComment')) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Resolve comment
    await collaboration.resolveComment(commentIndex, req.user.id);
    
    res.json({ msg: 'Comment resolved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/collaborations/:id/tasks
// @desc    Add a task to the collaboration
// @access  Private (Members with canInvite permission)
router.post('/:id/tasks', [
  auth,
  tenantMiddleware,
  check('title', 'Task title is required').not().isEmpty(),
  check('assignedTo', 'Assigned to is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    description,
    assignedTo,
    priority,
    dueDate
  } = req.body;

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user has permission to invite
    if (!collaboration.hasPermission(req.user.id, 'canInvite')) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Check if assigned user exists and is a member
    const isMember = collaboration.members.some(
      member => member.userId.toString() === assignedTo && member.status === 'accepted'
    );
    
    if (!isMember && assignedTo !== collaboration.ownerId.toString()) {
      return res.status(400).json({ msg: 'Assigned user is not a member of the collaboration' });
    }
    
    // Add task
    await collaboration.addTask(
      title,
      description || '',
      assignedTo,
      req.user.id,
      priority || 'medium',
      dueDate || null
    );
    
    res.json({ msg: 'Task added' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/collaborations/:id/tasks/:taskIndex
// @desc    Update a task
// @access  Private (Task assignee or owner)
router.put('/:id/tasks/:taskIndex', [
  auth,
  tenantMiddleware,
  check('status', 'Status is required').isIn(['todo', 'in-progress', 'review', 'completed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    status,
    priority,
    dueDate
  } = req.body;
  const taskIndex = parseInt(req.params.taskIndex);

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if task exists
    if (!collaboration.tasks[taskIndex]) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if user is the task assignee or owner
    const task = collaboration.tasks[taskIndex];
    if (task.assignedTo.toString() !== req.user.id && !collaboration.isOwner(req.user.id)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Build updates object
    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    
    // Update task
    await collaboration.updateTask(taskIndex, updates, req.user.id);
    
    res.json({ msg: 'Task updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/collaborations/:id/versions
// @desc    Create a new version
// @access  Private (Members with canEdit permission)
router.post('/:id/versions', [
  auth,
  tenantMiddleware,
  check('changes', 'Changes description is required').not().isEmpty(),
  check('snapshot', 'Content snapshot is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    changes,
    snapshot
  } = req.body;

  try {
    const collaboration = await Collaboration.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!collaboration) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }
    
    // Check if user has permission to edit
    if (!collaboration.hasPermission(req.user.id, 'canEdit')) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Create version
    await collaboration.createVersion(req.user.id, changes, snapshot);
    
    res.json({ msg: 'Version created' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;