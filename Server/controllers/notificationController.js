import prisma from '../../prisma/client.js';

// GET notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const { id: employeeId } = req.user; // Changed from userId to employeeId

    const notifications = await prisma.notification.findMany({
      where: { employeeId }, // Changed from userId to employeeId
      include: {
        goal: {
          select: {
            id: true,
            goalTitle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 notifications
    });

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead, // Changed from read to isRead
      createdAt: notification.createdAt,
      goal: notification.goal ? {
        id: notification.goal.id,
        title: notification.goal.goalTitle
      } : null
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// MARK notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: employeeId } = req.user; // Changed from userId to employeeId

    const notificationId = Number(id);
    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    // Check if notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: { 
        id: notificationId,
        employeeId: employeeId // Changed from userId to employeeId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true } // Changed from read to isRead
    });

    res.json({ 
      message: 'Notification marked as read',
      notification: updatedNotification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// MARK all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { id: employeeId } = req.user; // Changed from userId to employeeId

    const result = await prisma.notification.updateMany({
      where: { 
        employeeId: employeeId, // Changed from userId to employeeId
        isRead: false // Changed from read to isRead
      },
      data: { isRead: true } // Changed from read to isRead
    });

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// GET unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const { id: employeeId } = req.user; // Changed from userId to employeeId

    const count = await prisma.notification.count({
      where: { 
        employeeId: employeeId, // Changed from userId to employeeId
        isRead: false // Changed from read to isRead
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// DELETE notification (optional - for cleanup)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: employeeId } = req.user; // Changed from userId to employeeId

    const notificationId = Number(id);
    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    // Check if notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: { 
        id: notificationId,
        employeeId: employeeId // Changed from userId to employeeId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// BULK delete old notifications (cleanup utility - admin only)
export const cleanupOldNotifications = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Default to 30 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: daysAgo
        },
        isRead: true // Changed from read to isRead - Only delete read notifications
      }
    });

    res.json({ 
      message: `Cleaned up old notifications`,
      deletedCount: result.count,
      olderThan: `${days} days`
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({ error: 'Failed to cleanup notifications' });
  }
};

// CREATE notification (utility function for other controllers to use)
export const createNotification = async (employeeId, title, message, type, goalId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        employeeId,
        title,
        message,
        type,
        goalId
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// GET notifications by type (optional - for filtering)
export const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { id: employeeId } = req.user;

    const notifications = await prisma.notification.findMany({
      where: { 
        employeeId,
        type
      },
      include: {
        goal: {
          select: {
            id: true,
            goalTitle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      goal: notification.goal ? {
        id: notification.goal.id,
        title: notification.goal.goalTitle
      } : null
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    res.status(500).json({ error: 'Failed to fetch notifications by type' });
  }
};