import prisma from '../../prisma/client.js';


export const getEmployeeGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching employee goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};


export const createGoal = async (req, res) => {
  const { employeeId, goalTitle, targetDate, status, progress } = req.body;

  try {
  
    const employeeIdInt = parseInt(employeeId);
    if (isNaN(employeeIdInt)) {
      return res.status(400).json({ error: 'Invalid employeeId format' });
    }


    const employee = await prisma.employee.findUnique({
      where: { id: employeeIdInt }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('Employee:', employee);


    const newGoal = await prisma.goal.create({
      data: {
        employeeId: employeeIdInt,
        name: employee.name,
        goalTitle,
        description: `Achieve performance excellence in ${employee.position || ''}`,
        deadline: new Date(targetDate),
        progress: parseInt(progress),
        status,
      }
    });

 
    const fullGoal = await prisma.goal.findUnique({
      where: { id: newGoal.id },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    res.status(201).json(fullGoal);

  } catch (err) {
    console.error('Error creating goal:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};
