import { Stack } from "expo-router";
import { View } from "react-native";
import Footer from "../components/ui/Footer";
import "../global.css";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            paddingBottom: 60, // Espaço para o Footer
          },
        }}
      />
      <Footer />
    </View>
  );
}
