
import prisma from '../../prisma/client.js';

// Helper function to create notifications
const createNotification = async (employeeId, title, message, type = 'INFO', goalId = null) => {
  try {
    await prisma.notification.create({
      data: {
        employeeId, // Changed from userId to employeeId
        title,
        message,
        type,
        goalId,
        isRead: false // Changed from read to isRead
      }
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Helper function to get admins and team leads
const getAdminsAndTeamLeads = async () => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        role: {
          in: ['ADMIN', 'TEAM_LEAD']
        }
      },
      select: { id: true, role: true }
    });
    return employees;
  } catch (error) {
    console.error('Failed to get admins and team leads:', error);
    return [];
  }
};

// GET all goals with nested employee and department
export const getEmployeeGoals = async (req, res) => {
  try {
    const { role, id: currentEmployeeId } = req.user; // Changed from currentUserId to currentEmployeeId
    
    let whereClause = {};
    
    // If employee, only show their own goals
    if (role === 'EMPLOYEE') {
      whereClause.employeeId = currentEmployeeId;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        employee: {
          include: { department: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    const formattedGoals = goals.map(g => ({
      id: g.id,
      goalTitle: g.goalTitle,
      deadline: g.deadline,
      status: g.status !== 'Completed' && g.deadline && g.deadline < now ? 'Overdue' : g.status,
      progress: g.progress ?? 0,
      priority: g.priority ?? 'Medium',
      employee: {
        id: g.employeeId,
        name: g.employee?.name ?? null,
        department: {
          name: g.employee?.department?.name ?? null
        }
      },
      createdAt: g.createdAt,
      updatedAt: g.updatedAt
    }));

    res.json(formattedGoals);
  } catch (err) {
    console.error('Error fetching employee goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

// POST a new goal (ADMIN and TEAM_LEAD only)
export const createGoal = async (req, res) => {
  const { employeeId, goalTitle, deadline } = req.body;

  try {
    // Validate required fields
    if (!employeeId || !goalTitle || !deadline) {
      return res.status(400).json({ 
        error: 'Missing required fields: employeeId, goalTitle, and deadline are required' 
      });
    }

    const employeeIdInt = Number(employeeId);
    if (!Number.isInteger(employeeIdInt)) {
      return res.status(400).json({ error: 'Invalid employeeId format' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeIdInt },
      include: { department: true }
    });
    
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const newGoal = await prisma.goal.create({
      data: {
        employeeId: employeeIdInt,
        name: employee.name,
        goalTitle,
        description: `Goal assigned: ${goalTitle}`,
        deadline: new Date(deadline),
        status: 'Not Started',
        progress: 0,
        priority: 'Medium'
      },
      include: { employee: { include: { department: true } } }
    });

    // Create notification for the assigned employee
    await createNotification(
      employeeIdInt, // Direct employee ID
      'New Goal Assigned',
      `You have been assigned a new goal: "${goalTitle}". Deadline: ${new Date(deadline).toLocaleDateString()}`,
      'GOAL_ASSIGNED',
      newGoal.id
    );

    res.status(201).json(newGoal);
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

// UPDATE goal status and progress (for employees)
export const updateGoalStatus = async (req, res) => {
  const { id } = req.params;
  const { status, progress, notes } = req.body;
  const currentUser = req.user;

  try {
    const goalId = Number(id);
    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    // Find the goal with employee info
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if user can update this goal
    const canUpdate = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'TEAM_LEAD' || 
                     existingGoal.employeeId === currentUser.id;

    if (!canUpdate) {
      return res.status(403).json({ error: 'You can only update your own goals' });
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress: Number(progress) }),
        updatedAt: new Date()
      },
      include: { employee: { include: { department: true } } }
    });

    // Notify admins and team leads about the status update
    const adminsAndTeamLeads = await getAdminsAndTeamLeads();
    const notificationPromises = adminsAndTeamLeads.map(employee => 
      createNotification(
        employee.id,
        'Goal Progress Update',
        `${existingGoal.employee.name} updated progress on "${existingGoal.goalTitle}" to ${progress || existingGoal.progress}% (Status: ${status || existingGoal.status})${notes ? `. Notes: ${notes}` : ''}`,
        'PROGRESS_UPDATE',
        goalId
      )
    );

    await Promise.all(notificationPromises);

    res.json(updatedGoal);
  } catch (err) {
    console.error('Error updating goal status:', err);
    res.status(500).json({ error: 'Failed to update goal status' });
  }
};

// UPDATE a goal (ADMIN and TEAM_LEAD only) - for deadline changes
export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { goalTitle, deadline, status, progress, priority, description, name } = req.body;

  try {
    const goalId = Number(id);
    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(goalTitle !== undefined && { goalTitle }),
        ...(description !== undefined && { description }),
        ...(name !== undefined && { name }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(status !== undefined && { status }),
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(priority !== undefined && { priority })
      },
      include: { employee: { include: { department: true } } }
    });

    // If deadline was updated, notify the employee
    if (deadline) {
      const oldDeadline = existingGoal.deadline ? new Date(existingGoal.deadline).toLocaleDateString() : 'None';
      const newDeadline = new Date(deadline).toLocaleDateString();
      
      await createNotification(
        existingGoal.employeeId,
        'Goal Deadline Updated',
        `The deadline for "${existingGoal.goalTitle}" has been updated from ${oldDeadline} to ${newDeadline}`,
        'DEADLINE_UPDATE',
        goalId
      );
    }

    res.json(updatedGoal);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Goal not found' });
    }
    console.error('Error updating goal:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// DELETE a goal (ADMIN and TEAM_LEAD only)
export const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goalId = Number(id);
    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Delete related notifications first (goal relation will handle cascade)
    await prisma.notification.deleteMany({ where: { goalId: goalId } });
    
    // Then delete the goal
    await prisma.goal.delete({ where: { id: goalId } });

    // Notify the employee about goal deletion
    await createNotification(
      existingGoal.employeeId,
      'Goal Removed',
      `The goal "${existingGoal.goalTitle}" has been removed from your assignments`,
      'GOAL_REMOVED'
    );

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Goal not found' });
    }
    console.error('Error deleting goal:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

// BULK actions (complete, delete, in-progress) - ADMIN and TEAM_LEAD only
export const bulkAction = async (req, res) => {
  const { goalIds, action } = req.body;

  try {
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return res.status(400).json({ error: 'No goals selected' });
    }

    if (!action || !['complete', 'delete', 'in-progress'].includes(action)) {
      return res.status(400).json({ error: 'Invalid or missing action. Valid actions: complete, delete, in-progress' });
    }

    const ids = goalIds.map(Number).filter(Number.isInteger);
    if (ids.length === 0) {
      return res.status(400).json({ error: 'Invalid goal IDs' });
    }

    const existingGoals = await prisma.goal.findMany({
      where: { id: { in: ids } },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });
    
    if (existingGoals.length === 0) {
      return res.status(404).json({ error: 'No valid goals found for the provided IDs' });
    }

    const existingIds = existingGoals.map(g => g.id);
    let result;
    let notificationTitle;
    let getNotificationMessage;

    switch (action) {
      case 'complete':
        result = await prisma.goal.updateMany({
          where: { id: { in: existingIds } },
          data: { status: 'Completed', progress: 100 }
        });
        notificationTitle = 'Goal Completed';
        getNotificationMessage = (goal) => `Your goal "${goal.goalTitle}" has been marked as completed`;
        break;
        
      case 'delete':
        // Delete related notifications first
        await prisma.notification.deleteMany({ where: { goalId: { in: existingIds } } });
        
        result = await prisma.goal.deleteMany({ where: { id: { in: existingIds } } });
        notificationTitle = 'Goals Removed';
        getNotificationMessage = (goal) => `Your goal "${goal.goalTitle}" has been removed`;
        break;
        
      case 'in-progress':
        result = await prisma.goal.updateMany({
          where: { id: { in: existingIds } },
          data: { status: 'In Progress' }
        });
        notificationTitle = 'Goal Status Updated';
        getNotificationMessage = (goal) => `Your goal "${goal.goalTitle}" status has been updated to In Progress`;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Send notifications to affected employees
    const notificationPromises = existingGoals.map(goal => 
      createNotification(
        goal.employeeId, // Direct employee ID
        notificationTitle,
        getNotificationMessage(goal),
        'BULK_ACTION'
      )
    );

    await Promise.all(notificationPromises);

    res.json({ 
      message: `Bulk ${action} completed successfully`, 
      affectedGoals: result.count,
      requestedGoals: ids.length,
      ...(existingIds.length !== ids.length && { 
        warning: `${ids.length - existingIds.length} goal(s) not found and were skipped` 
      })
    });
  } catch (err) {
    console.error('Error performing bulk action:', err);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
};

// GET goal details with progress history (if you have goal updates)
export const getGoalDetails = async (req, res) => {
  const { id } = req.params;
  const { role, id: currentEmployeeId } = req.user;

  try {
    const goalId = Number(id);
    if (!Number.isInteger(goalId)) {
      return res.status(400).json({ error: 'Invalid goal ID format' });
    }

    let whereClause = { id: goalId };
    
    // If employee, only allow viewing their own goals
    if (role === 'EMPLOYEE') {
      whereClause.employeeId = currentEmployeeId;
    }

    const goal = await prisma.goal.findUnique({
      where: whereClause,
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const now = new Date();
    const formattedGoal = {
      id: goal.id,
      name: goal.name,
      goalTitle: goal.goalTitle,
      description: goal.description,
      deadline: goal.deadline,
      status: goal.status !== 'Completed' && goal.deadline && goal.deadline < now ? 'Overdue' : goal.status,
      progress: goal.progress ?? 0,
      priority: goal.priority ?? 'Medium',
      employee: {
        id: goal.employeeId,
        name: goal.employee?.name ?? null,
        department: {
          id: goal.employee?.department?.id ?? null,
          name: goal.employee?.department?.name ?? null
        }
      },
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    };

    res.json(formattedGoal);
  } catch (err) {
    console.error('Error fetching goal details:', err);
    res.status(500).json({ error: 'Failed to fetch goal details' });
  }
};
