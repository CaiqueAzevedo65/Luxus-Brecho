import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabBarBackground() {
  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#151718' }, 'background');
  
  return (
    <BlurView
      tint="default"
      intensity={95}
      style={[StyleSheet.absoluteFillObject, { backgroundColor }]}
    />
  );
}
