const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware to authenticate JWT token
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is a creator
const isCreator = async (req, res, next) => {
  try {
    // Check if user has creator role
    if (req.user.role !== 'creator') {
      return res.status(403).json({ msg: 'Access denied. Creator role required.' });
    }
    
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Middleware to check if user is a learner
const isLearner = async (req, res, next) => {
  try {
    // Check if user has learner role
    if (req.user.role !== 'learner') {
      return res.status(403).json({ msg: 'Access denied. Learner role required.' });
    }
    
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Middleware to check if user is either creator or learner
const isCreatorOrLearner = async (req, res, next) => {
  try {
    // Check if user has creator or learner role
    if (req.user.role !== 'creator' && req.user.role !== 'learner') {
      return res.status(403).json({ msg: 'Access denied. Creator or Learner role required.' });
    }
    
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Middleware to check if user owns the resource
const isOwner = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ msg: 'Resource not found' });
      }
      
      // Check if user is the owner of the resource
      if (resource.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied. Not the owner of this resource.' });
      }
      
      next();
    } catch (err) {
      res.status(500).send('Server Error');
    }
  };
};

module.exports = {
  auth,
  isCreator,
  isLearner,
  isCreatorOrLearner,
  isOwner
};