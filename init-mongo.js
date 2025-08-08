// MongoDB initialization script
db = db.getSiblingDB('elearning');

// Create collections
db.createCollection('users');
db.createCollection('tenants');
db.createCollection('courses');
db.createCollection('presentations');
db.createCollection('quizzes');
db.createCollection('screenshots');
db.createCollection('tutorials');
db.createCollection('analytics');

// Create indexes for better performance
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ tenantId: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

// Tenants collection
db.tenants.createIndex({ slug: 1 }, { unique: true });
db.tenants.createIndex({ name: 1 });
db.tenants.createIndex({ isActive: 1 });

// Courses collection
db.courses.createIndex({ tenantId: 1 });
db.courses.createIndex({ createdBy: 1 });
db.courses.createIndex({ isPublished: 1 });
db.courses.createIndex({ isFeatured: 1 });
db.courses.createIndex({ category: 1 });
db.courses.createIndex({ tags: 1 });
db.courses.createIndex({ createdAt: -1 });

// Presentations collection
db.presentations.createIndex({ tenantId: 1 });
db.presentations.createIndex({ createdBy: 1 });
db.presentations.createIndex({ isPublished: 1 });
db.presentations.createIndex({ isFeatured: 1 });
db.presentations.createIndex({ category: 1 });
db.presentations.createIndex({ tags: 1 });
db.presentations.createIndex({ createdAt: -1 });

// Quizzes collection
db.quizzes.createIndex({ tenantId: 1 });
db.quizzes.createIndex({ createdBy: 1 });
db.quizzes.createIndex({ isPublished: 1 });
db.quizzes.createIndex({ category: 1 });
db.quizzes.createIndex({ tags: 1 });
db.quizzes.createIndex({ createdAt: -1 });

// Screenshots collection
db.screenshots.createIndex({ tenantId: 1 });
db.screenshots.createIndex({ createdBy: 1 });
db.screenshots.createIndex({ tutorialId: 1 });
db.screenshots.createIndex({ tags: 1 });
db.screenshots.createIndex({ createdAt: -1 });

// Tutorials collection
db.tutorials.createIndex({ tenantId: 1 });
db.tutorials.createIndex({ createdBy: 1 });
db.tutorials.createIndex({ isPublished: 1 });
db.tutorials.createIndex({ category: 1 });
db.tutorials.createIndex({ tags: 1 });
db.tutorials.createIndex({ createdAt: -1 });

// Analytics collection
db.analytics.createIndex({ tenantId: 1 });
db.analytics.createIndex({ userId: 1 });
db.analytics.createIndex({ type: 1 });
db.analytics.createIndex({ createdAt: -1 });

// Create a default admin user
db.users.insertOne({
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create a default tenant
db.tenants.insertOne({
  name: 'Default Organization',
  slug: 'default-org',
  settings: {
    theme: 'default',
    customCSS: '',
    allowRegistration: true,
    requireEmailVerification: false,
    maxUsers: 100,
    maxStorage: 10737418240 // 10GB in bytes
  },
  subscription: {
    plan: 'premium',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    features: {
      maxUsers: 100,
      maxStorage: 10737418240, // 10GB in bytes
      customDomain: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true
    }
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed successfully!');