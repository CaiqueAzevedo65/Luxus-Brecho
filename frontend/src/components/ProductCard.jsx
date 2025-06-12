import React from 'react';

function ProductCard({ imageSrc, altText, productName, rating, price }) {
  return (
    <div className="product-card">
      <img src={imageSrc} alt={altText} />
      <p className="product-name">{productName}</p>
      <div className="product-rating">
        <span>{rating}</span>
      </div>
      <p className="product-price">{price}</p>
    </div>
  );
}

export default ProductCard;
