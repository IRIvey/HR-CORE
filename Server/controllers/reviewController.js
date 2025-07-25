import prisma from '../../prisma/client.js';


export const getPerformanceReviews = async (req, res) => {
  try {
    const reviews = await prisma.performanceReview.findMany({
      include: {
        employee: true,  
      },
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching performance reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
};


export const addPerformanceReview = async (req, res) => {
  const { employeeId, rating, feedback, reviewDate } = req.body;

  try {

    if (!employeeId || !rating || !feedback || !reviewDate) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, rating, feedback, or reviewDate' });
    }

    if (isNaN(parseFloat(rating))) {
      return res.status(400).json({ error: 'Invalid rating. It must be a number.' });
    }

    const parsedDate = new Date(reviewDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }


    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

  
    const newReview = await prisma.performanceReview.create({
      data: {
        employeeId,
        rating: parseFloat(rating),  
        feedback, 
        reviewDate: parsedDate, 
      },
    });

 
    const fullReview = await prisma.performanceReview.findUnique({
      where: { id: newReview.id },
      include: {
        employee: {
          include: { department: true },  
        },
      },
    });

    // Respond with the created review
    res.status(201).json(fullReview);
  } catch (err) {
    console.error('Error creating performance review:', err);
    res.status(500).json({ error: 'Failed to create review', details: err.message });
  }
};
