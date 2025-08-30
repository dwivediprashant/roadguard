import Notification from '../models/Notification.js';

export const createNotification = async (userId, type, title, message, taskId = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      taskId
    });

    await notification.save();
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('taskId', 'title description');

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const notifyTaskAssigned = async (workerId, task, io) => {
  const notification = await createNotification(
    workerId,
    'task_assigned',
    'New Task Assigned',
    `You have been assigned a new task: ${task.title}`,
    task._id
  );

  // Emit real-time notification
  io.to(`user_${workerId}`).emit('notification', notification);
  
  return notification;
};