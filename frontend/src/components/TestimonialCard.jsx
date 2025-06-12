import React from 'react';

function TestimonialCard({ rating, author, text }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-rating">{rating}</div>
      <p className="testimonial-author">{author}</p>
      <p className="testimonial-text">{text}</p>
    </div>
  );
}

export default TestimonialCard;
