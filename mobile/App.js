import React, { useEffect } from 'react';
import AppNavigator from './navigation';
import { useCartStore } from './store/cartStore';

export default function App() {
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart();
  }, []);

  return <AppNavigator />;
}
