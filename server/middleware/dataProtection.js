const crypto = require('crypto');
const { User } = require('../models/User');
const { Tenant } = require('../models/Tenant');

// Data protection middleware
const dataProtectionMiddleware = {
  // Encrypt sensitive data
  encryptData: (data, encryptionKey) => {
    if (!data || !encryptionKey) return data;
    
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  },

  // Decrypt sensitive data
  decryptData: (encryptedData, encryptionKey) => {
    if (!encryptedData || !encryptionKey) return encryptedData;
    
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const textParts = encryptedData.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encrypted = textParts.join(':');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData;
    }
  },

  // Hash data for pseudonymization
  hashData: (data) => {
    if (!data) return null;
    
    try {
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      console.error('Hashing error:', error);
      return data;
    }
  },

  // Anonymize user data for GDPR compliance
  anonymizeUserData: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate a pseudonym for the user
      const pseudonym = `user_${crypto.randomBytes(16).toString('hex')}`;
      
      // Anonymize personal data
      user.firstName = 'Anonymous';
      user.lastName = 'User';
      user.email = `${pseudonym}@anonymized.com`;
      user.phone = null;
      user.address = null;
      user.avatar = null;
      user.isAnonymized = true;
      
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      return false;
    }
  },

  // Delete user data for GDPR "right to be forgotten"
  deleteUserData: async (userId) => {
    try {
      // Delete user
      await User.findByIdAndDelete(userId);
      
      // In a real application, you would also delete or anonymize all related data
      // This would include courses, presentations, quizzes, etc. created by the user
      // For this example, we'll just log that this would happen
      
      console.log(`User ${userId} has been deleted. Related data should also be deleted or anonymized.`);
      
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      return false;
    }
  },

  // Export user data for GDPR "right to data portability"
  exportUserData: async (userId) => {
    try {
      const user = await User.findById(userId).select('-password -__v');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In a real application, you would also include all related data
      // This would include courses, presentations, quizzes, etc. created by the user
      // For this example, we'll just return the user data
      
      const userData = {
        profile: user.toObject(),
        // Related data would be included here
      };
      
      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  },

  // Check if user has consented to data processing
  hasConsent: (user, consentType) => {
    if (!user || !user.consents) return false;
    
    const consent = user.consents.find(c => c.type === consentType);
    return consent && consent.status === 'granted';
  },

  // Record user consent
  recordConsent: async (userId, consentType, consentStatus) => {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Initialize consents array if it doesn't exist
      if (!user.consents) {
        user.consents = [];
      }
      
      // Find existing consent of the same type
      const existingConsentIndex = user.consents.findIndex(c => c.type === consentType);
      
      if (existingConsentIndex !== -1) {
        // Update existing consent
        user.consents[existingConsentIndex] = {
          type: consentType,
          status: consentStatus,
          timestamp: new Date()
        };
      } else {
        // Add new consent
        user.consents.push({
          type: consentType,
          status: consentStatus,
          timestamp: new Date()
        });
      }
      
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error recording consent:', error);
      return false;
    }
  },

  // Middleware to check consent before processing personal data
  requireConsent: (consentType) => {
    return (req, res, next) => {
      if (!req.user || !dataProtectionMiddleware.hasConsent(req.user, consentType)) {
        return res.status(403).json({
          msg: `Consent for ${consentType} is required`
        });
      }
      next();
    };
  },

  // Middleware to log data access for audit purposes
  logDataAccess: (resourceType) => {
    return (req, res, next) => {
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to log after response is sent
      res.send = function(data) {
        // Log data access
        console.log(`Data access log: ${req.user.id} accessed ${resourceType} at ${new Date().toISOString()}`);
        
        // Call original send method
        originalSend.call(this, data);
      };
      
      next();
    };
  },

  // Middleware to validate data retention policies
  validateDataRetention: (maxAgeInDays) => {
    return async (req, res, next) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
        
        // In a real application, you would check if the data being accessed
        // is older than the retention period and handle accordingly
        // For this example, we'll just pass through
        
        next();
      } catch (error) {
        console.error('Error validating data retention:', error);
        next();
      }
    };
  },

  // Generate a data processing agreement
  generateDPA: (tenantId) => {
    return {
      tenantId,
      agreementType: 'Data Processing Agreement',
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      dataController: {
        name: 'eLearning Platform',
        contact: 'privacy@elearning.com'
      },
      dataProcessor: {
        name: 'eLearning Platform',
        contact: 'privacy@elearning.com'
      },
      dataCategories: [
        'Personal identification information',
        'Contact information',
        'Learning progress data',
        'Content creation data'
      ],
      dataSubjects: ['Users', 'Learners', 'Creators'],
      purpose: 'Providing e-learning services and content management',
      retentionPeriod: 'Until account deletion or as required by law',
      securityMeasures: [
        'Encryption of sensitive data',
        'Access controls',
        'Regular security audits',
        'Data breach notification procedures'
      ],
      subprocessing: 'Only with prior written consent from the data controller',
      dataSubjectRights: [
        'Right to access',
        'Right to rectification',
        'Right to erasure',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object'
      ]
    };
  }
};

module.exports = dataProtectionMiddleware;