import React from 'react';
import TestimonialCard from './TestimonialCard'; // Assuming TestimonialCard.jsx is in the same directory

const testimonialData = [
  {
    rating: '★★★★★',
    author: 'Sadie A.',
    text: '"Encontrar roupas que alinham com meu gosto pessoal era muito difícil até eu descobrir a Luxus Brechó!"'
  },
  {
    rating: '★★★★★',
    author: 'John M.',
    text: '"Consegui encontrar roupas de presente para minha esposa, um ótimo presente!"'
  },
  {
    rating: '★★★★★',
    author: 'Arthur N.',
    text: '"Acredito que foi a loja com maior custo benefício que encontrei com tamanha qualidade!"'
  }
];

function Testimonials() {
  return (
    <section id="testimonials" className="container">
      <h2>CLIENTES SATISFEITOS</h2>
      <div className="testimonial-grid">
        {testimonialData.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            rating={testimonial.rating}
            author={testimonial.author}
            text={testimonial.text}
          />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
