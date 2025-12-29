export const config = {
  // Server
  port: parseInt(process.env.PORT || '9030', 10),
  host: process.env.HOST || '0.0.0.0',
  isDevelopment: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://nexus:nexus@localhost:5432/nexus_cleaning',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // RabbitMQ
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://nexus:nexus@localhost:5672',

  // Nexus GraphRAG
  nexusApiUrl: process.env.NEXUS_API_URL || 'http://localhost:9001',

  // External Services
  propertyManagementApiUrl: process.env.PROPERTY_MANAGEMENT_API_URL || 'http://localhost:9020',
  smartLockApiUrl: process.env.SMART_LOCK_API_URL || 'http://localhost:9040',

  // Route Optimization
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

  // File Storage
  s3Bucket: process.env.S3_BUCKET || 'nexus-cleaning',
  awsRegion: process.env.AWS_REGION || 'us-east-1',

  // Automation Settings
  autoAssignment: {
    enabled: process.env.AUTO_ASSIGNMENT_ENABLED !== 'false',
    maxTasksPerCleaner: parseInt(process.env.MAX_TASKS_PER_CLEANER || '3', 10),
    proximityRadiusMiles: parseFloat(process.env.PROXIMITY_RADIUS_MILES || '25'),
  },

  // Quality Control
  qualityCheck: {
    requiredForHighPriority: process.env.QC_REQUIRED_HIGH_PRIORITY !== 'false',
    randomCheckPercentage: parseFloat(process.env.QC_RANDOM_PERCENTAGE || '0.2'),
  },

  // Notifications
  notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
};
