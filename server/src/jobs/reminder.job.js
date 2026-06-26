import cron from 'node-cron';
import { Op } from 'sequelize';
import { logger } from '../config/logger.js';
import { Task } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { addNotificationJob, addEmailJob } from './queue.js';
import { emailService } from '../integrations/email.service.js';

class ReminderJob {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Reminder jobs already running');
      return;
    }

    this.isRunning = true;

    // Check upcoming tasks - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.checkUpcomingTasks();
    });

    // Check upcoming events - every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.checkUpcomingEvents();
    });

    // Check overdue tasks - hourly
    cron.schedule('0 * * * *', async () => {
      await this.checkOverdueTasks();
    });

    // Daily summary - every day at 8 AM
    cron.schedule('0 8 * * *', async () => {
      await this.sendDailySummary();
    });

    // Weekly summary - every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      await this.sendWeeklySummary();
    });

    logger.info('✅ Reminder jobs started');
  }

  async checkUpcomingTasks() {
    try {
      const now = new Date();
      const twoHoursLater = new Date(now);
      twoHoursLater.setHours(twoHoursLater.getHours() + 2);

      const tasks = await Task.findAll({
        where: {
          due_date: {
            [Op.between]: [now, twoHoursLater],
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
          reminder_sent: false,
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      for (const task of tasks) {
        const user = task.assignee;
        if (!user) continue;

        // Send notification
        await addNotificationJob({
          userId: user.id,
          type: 'task_reminder',
          title: 'Görev Hatırlatması',
          message: `"${task.title}" görevinin son tarihi yaklaşıyor! (${new Date(task.due_date).toLocaleString('tr-TR')})`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.due_date,
            priority: task.priority,
          },
        });

        // Send email
        await addEmailJob({
          to: user.email,
          subject: `Görev Hatırlatması: ${task.title}`,
          html: `
            <h1>Görev Hatırlatması</h1>
            <p>Merhaba ${user.first_name},</p>
            <p><strong>${task.title}</strong> görevinin son tarihi yaklaşıyor:</p>
            <p><strong>Son Tarih:</strong> ${new Date(task.due_date).toLocaleString('tr-TR')}</p>
            <p><strong>Öncelik:</strong> ${task.priority}</p>
            <a href="${process.env.CLIENT_URL}/tasks/${task.id}">Görevi Görüntüle</a>
          `,
        });

        await task.update({ reminder_sent: true });
        logger.info(`✅ Reminder sent for task: ${task.id} (${task.title})`);
      }
    } catch (error) {
      logger.error('❌ Task reminder job error:', error);
    }
  }

  async checkUpcomingEvents() {
    try {
      const now = new Date();
      const oneDayLater = new Date(now);
      oneDayLater.setDate(oneDayLater.getDate() + 1);

      const events = await Event.findAll({
        where: {
          start_date: {
            [Op.between]: [now, oneDayLater],
          },
          status: 'scheduled',
          reminder_sent: false,
        },
        include: [
          {
            model: User,
            as: 'assignedTo',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      for (const event of events) {
        const user = event.assignedTo;
        if (!user) continue;

        await addNotificationJob({
          userId: user.id,
          type: 'event_reminder',
          title: 'Etkinlik Hatırlatması',
          message: `"${event.title}" etkinliği yaklaşıyor! (${new Date(event.start_date).toLocaleString('tr-TR')})`,
          data: {
            eventId: event.id,
            eventTitle: event.title,
            startDate: event.start_date,
            location: event.location,
          },
        });

        await addEmailJob({
          to: user.email,
          subject: `Etkinlik Hatırlatması: ${event.title}`,
          html: `
            <h1>Etkinlik Hatırlatması</h1>
            <p>Merhaba ${user.first_name},</p>
            <p><strong>${event.title}</strong> etkinliği yaklaşıyor:</p>
            <p><strong>Tarih:</strong> ${new Date(event.start_date).toLocaleString('tr-TR')}</p>
            ${event.location ? `<p><strong>Yer:</strong> ${event.location}</p>` : ''}
            <a href="${process.env.CLIENT_URL}/calendar">Takvimi Görüntüle</a>
          `,
        });

        await event.update({ reminder_sent: true });
        logger.info(`✅ Reminder sent for event: ${event.id} (${event.title})`);
      }
    } catch (error) {
      logger.error('❌ Event reminder job error:', error);
    }
  }

  async checkOverdueTasks() {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const tasks = await Task.findAll({
        where: {
          due_date: {
            [Op.lt]: now,
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      for (const task of tasks) {
        const user = task.assignee;
        if (!user) continue;

        const daysOverdue = Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24));

        await addNotificationJob({
          userId: user.id,
          type: 'task_overdue',
          title: '⚠️ Gecikmiş Görev',
          message: `"${task.title}" görevi ${daysOverdue} gündür gecikti!`,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.due_date,
            daysOverdue,
            priority: task.priority,
          },
        });

        await addEmailJob({
          to: user.email,
          subject: `⚠️ Gecikmiş Görev: ${task.title}`,
          html: `
            <h1>Gecikmiş Görev Uyarısı</h1>
            <p>Merhaba ${user.first_name},</p>
            <p><strong>${task.title}</strong> görevi ${daysOverdue} gündür gecikti!</p>
            <p><strong>Son Tarih:</strong> ${new Date(task.due_date).toLocaleString('tr-TR')}</p>
            <p><strong>Gecikme:</strong> ${daysOverdue} gün</p>
            <a href="${process.env.CLIENT_URL}/tasks/${task.id}">Görevi Görüntüle</a>
          `,
        });

        logger.info(`⚠️ Overdue notification sent for task: ${task.id} (${daysOverdue} days)`);
      }
    } catch (error) {
      logger.error('❌ Overdue task job error:', error);
    }
  }

  async sendDailySummary() {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get tasks due today
      const tasksToday = await Task.findAll({
        where: {
          due_date: {
            [Op.between]: [today, tomorrow],
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      // Group tasks by user
      const userTasks = {};
      for (const task of tasksToday) {
        const userId = task.assigned_to;
        if (!userId) continue;
        if (!userTasks[userId]) {
          userTasks[userId] = {
            user: task.assignee,
            tasks: [],
          };
        }
        userTasks[userId].tasks.push(task);
      }

      // Send daily summary to each user
      for (const [userId, data] of Object.entries(userTasks)) {
        const { user, tasks } = data;
        if (!user) continue;

        const taskList = tasks.map(t => 
          `<li>${t.title} - ${t.priority} öncelik</li>`
        ).join('');

        await addEmailJob({
          to: user.email,
          subject: '📋 Günlük Görev Özeti',
          html: `
            <h1>Günlük Görev Özeti</h1>
            <p>Merhaba ${user.first_name},</p>
            <p>Bugün tamamlaman gereken ${tasks.length} görev var:</p>
            <ul>${taskList}</ul>
            <a href="${process.env.CLIENT_URL}/tasks">Tüm Görevleri Görüntüle</a>
          `,
        });

        logger.info(`📋 Daily summary sent to: ${user.email}`);
      }
    } catch (error) {
      logger.error('❌ Daily summary job error:', error);
    }
  }

  async sendWeeklySummary() {
    try {
      // Similar to daily summary but for weekly
      logger.info('📊 Weekly summary job executed');
    } catch (error) {
      logger.error('❌ Weekly summary job error:', error);
    }
  }

  stop() {
    this.isRunning = false;
    logger.info('⏹️ Reminder jobs stopped');
  }
}

export const reminderJob = new ReminderJob();
export default reminderJob;