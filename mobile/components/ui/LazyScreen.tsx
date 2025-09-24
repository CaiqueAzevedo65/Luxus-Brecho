import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LazyScreenProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'white'
  }}>
    <ActivityIndicator size="large" color="#E91E63" />
    <Text style={{ 
      marginTop: 16, 
      fontSize: 16, 
      color: '#666',
      textAlign: 'center'
    }}>
      Carregando...
    </Text>
  </View>
);

export const LazyScreen: React.FC<LazyScreenProps> = ({ 
  component: Component, 
  fallback = <DefaultFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

// HOC para criar lazy screens facilmente
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <LazyScreen 
      component={() => <Component {...props} />} 
      fallback={fallback} 
    />
  );
};
