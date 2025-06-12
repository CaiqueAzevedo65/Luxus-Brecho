import React from 'react';
import ProductCard from './ProductCard'; // Assuming ProductCard.jsx is in the same directory

const topSellingData = [
  { imageSrc: '/Bolsa-guess.png', altText: 'Bolsa Guess', productName: 'Bolsa Guess', rating: '★★★★★', price: '90$' },
  { imageSrc: '/Tamanco-vintage-N38.png', altText: 'Tamanco Vintage N°38', productName: 'Tamanco Vintage N°38', rating: '★★★★★', price: '30$' },
  { imageSrc: '/Bolsa-pequena.png', altText: 'Bolsa Pequena', productName: 'Bolsa Pequena', rating: '★★★★★', price: '20$' },
  { imageSrc: '/Moletom-garfield.png', altText: 'Moletom Garfield', productName: 'Moletom Garfield', rating: '★★★★★', price: '65$' },
];

function TopSelling() {
  return (
    <section id="top-selling" className="container">
      <h2>TOP SELLING</h2>
      <div className="product-grid">
        {topSellingData.map((product, index) => (
          <ProductCard
            key={index}
            imageSrc={product.imageSrc}
            altText={product.altText}
            productName={product.productName}
            rating={product.rating}
            price={product.price}
          />
        ))}
      </div>
    </section>
  );
}

export default TopSelling;
