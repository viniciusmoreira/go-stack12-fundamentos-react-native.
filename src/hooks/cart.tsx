import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prodStorage = await AsyncStorage.getItem('@gomarketplace:products');

      if (prodStorage) {
        setProducts(JSON.parse(prodStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex === -1) {
        setProducts(prevState => [...prevState, { ...product, quantity: 1 }]);
      } else {
        const updateProducts = [...products];
        updateProducts[productIndex].quantity += 1;
        setProducts(updateProducts);
      }

      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex >= 0) {
        const updateProducts = [...products];
        updateProducts[productIndex].quantity += 1;
        setProducts(updateProducts);
      }

      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      if (productIndex >= 0) {
        const updateProducts = [...products];
        if (updateProducts[productIndex].quantity - 1 >= 0)
          updateProducts[productIndex].quantity -= 1;
        setProducts(updateProducts);
      }

      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
