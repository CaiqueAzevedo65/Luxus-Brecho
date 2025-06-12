import React from 'react';

const styleCategories = [
  {
    title: 'Casual',
    images: [{ src: '/img-casual.png', alt: 'Estilo Casual' }]
  },
  {
    title: 'Formal',
    images: [
      { src: '/img-formal1.png', alt: 'Estilo Formal 1' },
      { src: '/img-formal2.png', alt: 'Estilo Formal 2' }
    ]
  },
  {
    title: 'Social',
    images: [
      { src: '/img-social1.png', alt: 'Estilo Social 1' },
      { src: '/img-social2.png', alt: 'Estilo Social 2' }
    ]
  },
  {
    title: 'Esportiva',
    images: [{ src: '/img-esportiva.png', alt: 'Estilo Esportivo' }]
  }
];

function StyleSearch() {
  return (
    <section id="search-by-style" className="container">
      <h2>PESQUISE POR ESTILO</h2>
      <div className="style-grid">
        {styleCategories.map((category, index) => (
          <div className="style-category-card" key={index}>
            <h3 className="style-category-title">{category.title}</h3>
            {category.images.length > 1 ? (
              <div className="style-image-group">
                {category.images.map((image, imgIndex) => (
                  <img key={imgIndex} src={image.src} alt={image.alt} />
                ))}
              </div>
            ) : (
              <img src={category.images[0].src} alt={category.images[0].alt} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StyleSearch;
