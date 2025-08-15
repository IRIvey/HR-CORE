import prisma from '../../prisma/client.js';

// GET all goals with nested employee and department
export const getEmployeeGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
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

// POST a new goal
export const createGoal = async (req, res) => {
  const { employeeId, goalTitle, deadline, status, progress, priority, description, name } = req.body;

  try {
    const employeeIdInt = Number(employeeId);
    if (!Number.isInteger(employeeIdInt)) {
      return res.status(400).json({ error: 'Invalid employeeId format' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeIdInt }
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const newGoal = await prisma.goal.create({
      data: {
        employeeId: employeeIdInt,
        // optional "name" and "description" exist in your schema; include if provided
        name: name ?? employee.name,
        goalTitle,
        description: description ?? `Achieve performance excellence in ${employee.position}`,
        deadline: new Date(deadline),
        status: status || 'Not Started',
        progress: Number(progress) || 0,
        priority: priority || 'Medium'
      },
      include: { employee: { include: { department: true } } }
    });

    res.status(201).json(newGoal);
  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

// UPDATE a goal
export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { goalTitle, deadline, status, progress, priority, description, name } = req.body;

  try {
    const updatedGoal = await prisma.goal.update({
      where: { id: Number(id) },
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

    res.json(updatedGoal);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Goal not found' });
    }
    console.error('Error updating goal:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// DELETE a goal
export const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.goal.delete({ where: { id: Number(id) } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Goal not found' });
    }
    console.error('Error deleting goal:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

// BULK actions (complete, delete, in-progress)
export const bulkAction = async (req, res) => {
  const { goalIds, action } = req.body;

  try {
    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      return res.status(400).json({ error: 'No goals selected' });
    }

    const ids = goalIds.map(Number).filter(Number.isInteger);
    if (ids.length === 0) return res.status(400).json({ error: 'Invalid goal IDs' });

    switch (action) {
      case 'complete':
        await prisma.goal.updateMany({
          where: { id: { in: ids } },
          data: { status: 'Completed', progress: 100 }
        });
        break;
      case 'delete':
        await prisma.goal.deleteMany({ where: { id: { in: ids } } });
        break;
      case 'in-progress':
        await prisma.goal.updateMany({
          where: { id: { in: ids } },
          data: { status: 'In Progress' }
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Bulk ${action} completed successfully`, affectedGoals: ids.length });
  } catch (err) {
    console.error('Error performing bulk action:', err);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
};

