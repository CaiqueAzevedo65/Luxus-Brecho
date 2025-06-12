import React from 'react';
import ProductCard from './ProductCard'; // Assuming ProductCard.jsx is in the same directory

const brandData = [
  {
    title: 'VERSACE',
    products: [
      { imageSrc: '/Bolsa-grande.png', altText: 'Bolsa Grande Versace', productName: 'Bolsa Grande', rating: '★★★★★', price: '90$' },
    ]
  },
  {
    title: 'ZARA',
    products: [
      { imageSrc: '/Cropped-girassol.png', altText: 'Cropped Girassol Zara', productName: 'Cropped Girassol', rating: '★★★★★', price: '20$' },
    ]
  },
  {
    title: 'GUCCI',
    products: [
      { imageSrc: '/Camisa-floral.png', altText: 'Camisa Floral Gucci', productName: 'Camisa floral', rating: '★★★★★', price: '28$' },
    ]
  },
  {
    title: 'PRADA',
    products: [
      { imageSrc: '/Bolsa-rosa-feminina.png', altText: 'Bolsa Rosa Feminina Prada', productName: 'Bolsa rosa feminina', rating: '★★★★★', price: '80$' },
    ]
  }
];

function Brands() {
  return (
    <section id="brands" className="container">
      {brandData.map((brand, index) => (
        <div className="brand-category" key={index}>
          <h3 className="brand-title">{brand.title}</h3>
          {brand.products.map((product, productIndex) => (
            <ProductCard
              key={productIndex}
              imageSrc={product.imageSrc}
              altText={product.altText}
              productName={product.productName}
              rating={product.rating}
              price={product.price}
            />
          ))}
        </div>
      ))}
    </section>
  );
}

export default Brands;
