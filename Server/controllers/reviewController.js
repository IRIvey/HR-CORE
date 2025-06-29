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
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
