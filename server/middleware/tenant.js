const mongoose = require('mongoose');

// Middleware to extract tenant information from request
const tenantMiddleware = async (req, res, next) => {
  try {
    // Get tenant ID from header or user object
    let tenantId = req.header('x-tenant-id');
    
    // If tenant ID not in header, get from authenticated user
    if (!tenantId && req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    }
    
    // If still no tenant ID, return error
    if (!tenantId) {
      return res.status(400).json({ msg: 'Tenant ID is required' });
    }
    
    // Validate tenant ID format
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ msg: 'Invalid tenant ID format' });
    }
    
    // Add tenant ID to request object
    req.tenantId = tenantId;
    
    next();
  } catch (err) {
    console.error('Tenant middleware error:', err.message);
    res.status(500).send('Server Error');
  }
};

// Middleware to filter queries by tenant ID
const tenantFilter = (Model) => {
  return async (req, res, next) => {
    try {
      // Store original find method
      const originalFind = Model.find;
      const originalFindOne = Model.findOne;
      const originalFindById = Model.findById;
      const originalCountDocuments = Model.countDocuments;
      
      // Override find method to add tenant filter
      Model.find = function(query = {}, ...args) {
        if (!query.tenantId) {
          query.tenantId = req.tenantId;
        }
        return originalFind.call(this, query, ...args);
      };
      
      // Override findOne method to add tenant filter
      Model.findOne = function(query = {}, ...args) {
        if (!query.tenantId) {
          query.tenantId = req.tenantId;
        }
        return originalFindOne.call(this, query, ...args);
      };
      
      // Override findById method to add tenant filter
      Model.findById = function(id, ...args) {
        const query = { _id: id, tenantId: req.tenantId };
        return originalFindOne.call(this, query, ...args);
      };
      
      // Override countDocuments method to add tenant filter
      Model.countDocuments = function(query = {}, ...args) {
        if (!query.tenantId) {
          query.tenantId = req.tenantId;
        }
        return originalCountDocuments.call(this, query, ...args);
      };
      
      // Restore original methods after response
      res.on('finish', () => {
        Model.find = originalFind;
        Model.findOne = originalFindOne;
        Model.findById = originalFindById;
        Model.countDocuments = originalCountDocuments;
      });
      
      next();
    } catch (err) {
      console.error('Tenant filter middleware error:', err.message);
      res.status(500).send('Server Error');
    }
  };
};

// Middleware to add tenant ID to request body for create/update operations
const addTenantToBody = (req, res, next) => {
  try {
    // If tenant ID is not already in the body, add it from request
    if (req.body && !req.body.tenantId) {
      req.body.tenantId = req.tenantId;
    }
    
    next();
  } catch (err) {
    console.error('Add tenant to body middleware error:', err.message);
    res.status(500).send('Server Error');
  }
};

// Middleware to validate tenant access
const validateTenantAccess = async (req, res, next) => {
  try {
    // If user is authenticated, check if they belong to the tenant
    if (req.user && req.user.tenantId && req.user.tenantId !== req.tenantId) {
      return res.status(403).json({ msg: 'Access denied. User does not belong to this tenant.' });
    }
    
    next();
  } catch (err) {
    console.error('Validate tenant access middleware error:', err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  tenantMiddleware,
  tenantFilter,
  addTenantToBody,
  validateTenantAccess
};