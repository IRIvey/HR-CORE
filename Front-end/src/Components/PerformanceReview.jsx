
import React, { useState } from 'react';
import './PerformanceReview.css';
import { User, Star, MessageCircle, Calendar, PlusCircle } from 'lucide-react';

const PerformanceReview = () => {
  const [reviews, setReviews] = useState([
    {
      id: "EMP001",
      name: "Zannatul Sabiha",
      department: "Engineering",
      rating: 4.5,
      feedback: "Consistently meets deadlines and delivers high-quality work.",
      reviewDate: "2025-06-01"
    },
    {
      id: "EMP002",
      name: "Aarav Rahman",
      department: "HR",
      rating: 3.8,
      feedback: "Strong communication skills but needs to improve task management.",
      reviewDate: "2025-06-10"
    }
  ]);

  const handleAddReview = () => {
   
    const newReview = {
      id: `EMP00${reviews.length + 1}`,
      name: "New Employee",
      department: "New Department",
      rating: 4.0,
      feedback: "New review added.",
      reviewDate: new Date().toISOString().split('T')[0]
    };
    setReviews([...reviews, newReview]);
  };

  return (
    <div className="review-container">
      <div className="review-header">
        <h2 className="review-title">Employee Performance Reviews</h2>
        <button className="add-review-btn" onClick={handleAddReview}>
          <PlusCircle size={18} /> Add Review
        </button>
      </div>
      
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-row"><User className="icon" size={16} /> <span className="label">Name:</span> {review.name}</div>
            <div className="review-row"><span className="label">Department:</span> {review.department}</div>
            <div className="review-row"><Star className="icon" size={16} /> <span className="label">Rating:</span> ⭐ {review.rating}</div>
            <div className="review-row"><MessageCircle className="icon" size={16} /> <span className="label">Feedback:</span> {review.feedback}</div>
            <div className="review-row"><Calendar className="icon" size={16} /> <span className="label">Date:</span> {review.reviewDate}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceReview;
