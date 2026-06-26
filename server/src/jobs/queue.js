import Bull from 'bull';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

// Create queues
export const emailQueue = new Bull('email-queue', {
  redis: {
    host: config.REDIS_HOST || 'localhost',
    port: config.REDIS_PORT || 6379,
    password: config.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const notificationQueue = new Bull('notification-queue', {
  redis: {
    host: config.REDIS_HOST || 'localhost',
    port: config.REDIS_PORT || 6379,
    password: config.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const aiQueue = new Bull('ai-queue', {
  redis: {
    host: config.REDIS_HOST || 'localhost',
    port: config.REDIS_PORT || 6379,
    password: config.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    timeout: 300000, // 5 minutes
  },
});

// Queue event handlers
const setupQueueEvents = (queue, name) => {
  queue.on('completed', (job) => {
    logger.info(`✅ ${name} job completed: ${job.id}`);
  });

  queue.on('failed', (job, err) => {
    logger.error(`❌ ${name} job failed: ${job.id}`, err);
  });

  queue.on('stalled', (job) => {
    logger.warn(`⚠️ ${name} job stalled: ${job.id}`);
  });

  queue.on('error', (error) => {
    logger.error(`❌ ${name} queue error:`, error);
  });
};

setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(notificationQueue, 'Notification');
setupQueueEvents(aiQueue, 'AI');

// Process email queue
emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data;
  // Email sending logic will be handled by email service
  logger.info(`📧 Email job processed for: ${to}`);
  return { sent: true, to, subject };
});

// Process notification queue
notificationQueue.process(async (job) => {
  const { userId, type, message, data } = job.data;
  // Notification logic will be handled by notification service
  logger.info(`🔔 Notification job processed for user: ${userId}`);
  return { sent: true, userId, type };
});

// Process AI queue
aiQueue.process(async (job) => {
  const { type, data } = job.data;
  // AI logic will be handled by AI service
  logger.info(`🤖 AI job processed: ${type}`);
  return { processed: true, type };
});

// Job functions
export const addEmailJob = async (data, options = {}) => {
  return emailQueue.add(data, options);
};

export const addNotificationJob = async (data, options = {}) => {
  return notificationQueue.add(data, options);
};

export const addAIJob = async (data, options = {}) => {
  return aiQueue.add(data, options);
};

// Bulk operations
export const addEmailJobs = async (jobs) => {
  return emailQueue.addBulk(jobs);
};

export const addNotificationJobs = async (jobs) => {
  return notificationQueue.addBulk(jobs);
};

export const addAIJobs = async (jobs) => {
  return aiQueue.addBulk(jobs);
};

// Queue status
export const getQueueStatus = async () => {
  const [emailCount, notificationCount, aiCount] = await Promise.all([
    emailQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
    aiQueue.getJobCounts(),
  ]);

  return {
    email: emailCount,
    notification: notificationCount,
    ai: aiCount,
  };
};

// Clean queues
export const cleanQueues = async () => {
  await Promise.all([
    emailQueue.clean(0, 'completed'),
    emailQueue.clean(0, 'failed'),
    notificationQueue.clean(0, 'completed'),
    notificationQueue.clean(0, 'failed'),
    aiQueue.clean(0, 'completed'),
    aiQueue.clean(0, 'failed'),
  ]);
};

export default {
  emailQueue,
  notificationQueue,
  aiQueue,
  addEmailJob,
  addNotificationJob,
  addAIJob,
  addEmailJobs,
  addNotificationJobs,
  addAIJobs,
  getQueueStatus,
  cleanQueues,
};