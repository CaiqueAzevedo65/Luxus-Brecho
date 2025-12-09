import './index.css';

/**
 * Componente base de Skeleton
 */
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  variant = 'rectangular' // rectangular, circular, text
}) => {
  const style = {
    width,
    height,
    borderRadius: variant === 'circular' ? '50%' : borderRadius,
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton para card de produto
 */
export const ProductCardSkeleton = () => (
  <div className="skeleton-product-card">
    <Skeleton height="200px" className="skeleton-image" />
    <div className="skeleton-content">
      <Skeleton width="80%" height="1.2rem" className="skeleton-title" />
      <Skeleton width="60%" height="1rem" className="skeleton-category" />
      <Skeleton width="40%" height="1.5rem" className="skeleton-price" />
      <Skeleton width="100%" height="40px" borderRadius="8px" className="skeleton-button" />
    </div>
  </div>
);

/**
 * Grid de skeletons de produtos
 */
export const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="skeleton-product-grid">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para card de categoria
 */
export const CategoryCardSkeleton = () => (
  <div className="skeleton-category-card">
    <Skeleton height="150px" className="skeleton-image" />
    <div className="skeleton-overlay">
      <Skeleton width="60%" height="1.5rem" />
    </div>
  </div>
);

/**
 * Grid de skeletons de categorias
 */
export const CategoryGridSkeleton = ({ count = 3 }) => (
  <div className="skeleton-category-grid">
    {Array.from({ length: count }).map((_, index) => (
      <CategoryCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para item do carrinho
 */
export const CartItemSkeleton = () => (
  <div className="skeleton-cart-item">
    <Skeleton width="80px" height="80px" className="skeleton-image" />
    <div className="skeleton-cart-content">
      <Skeleton width="70%" height="1rem" />
      <Skeleton width="40%" height="0.9rem" />
      <Skeleton width="30%" height="1.2rem" />
    </div>
    <Skeleton width="100px" height="36px" borderRadius="8px" />
  </div>
);

/**
 * Lista de skeletons de carrinho
 */
export const CartListSkeleton = ({ count = 3 }) => (
  <div className="skeleton-cart-list">
    {Array.from({ length: count }).map((_, index) => (
      <CartItemSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para card de pedido
 */
export const OrderCardSkeleton = () => (
  <div className="skeleton-order-card">
    <div className="skeleton-order-header">
      <Skeleton width="120px" height="1rem" />
      <Skeleton width="80px" height="24px" borderRadius="12px" />
    </div>
    <div className="skeleton-order-items">
      <Skeleton width="100%" height="60px" />
    </div>
    <div className="skeleton-order-footer">
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="80px" height="1.2rem" />
    </div>
  </div>
);

/**
 * Lista de skeletons de pedidos
 */
export const OrderListSkeleton = ({ count = 3 }) => (
  <div className="skeleton-order-list">
    {Array.from({ length: count }).map((_, index) => (
      <OrderCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para perfil de usuário
 */
export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <Skeleton width="100px" height="100px" variant="circular" className="skeleton-avatar" />
    <Skeleton width="200px" height="1.5rem" className="skeleton-name" />
    <Skeleton width="250px" height="1rem" className="skeleton-email" />
    <div className="skeleton-profile-actions">
      <Skeleton width="100%" height="50px" borderRadius="8px" />
      <Skeleton width="100%" height="50px" borderRadius="8px" />
      <Skeleton width="100%" height="50px" borderRadius="8px" />
    </div>
  </div>
);

/**
 * Skeleton para banner
 */
export const BannerSkeleton = () => (
  <div className="skeleton-banner">
    <Skeleton width="100%" height="400px" borderRadius="12px" />
  </div>
);

/**
 * Skeleton para detalhes do produto
 */
export const ProductDetailSkeleton = () => (
  <div className="skeleton-product-detail">
    <div className="skeleton-detail-image">
      <Skeleton width="100%" height="400px" />
    </div>
    <div className="skeleton-detail-info">
      <Skeleton width="80%" height="2rem" className="skeleton-title" />
      <Skeleton width="40%" height="1rem" className="skeleton-category" />
      <Skeleton width="30%" height="2rem" className="skeleton-price" />
      <div className="skeleton-description">
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="70%" height="1rem" />
      </div>
      <Skeleton width="100%" height="50px" borderRadius="8px" className="skeleton-button" />
    </div>
  </div>
);

export default Skeleton;
