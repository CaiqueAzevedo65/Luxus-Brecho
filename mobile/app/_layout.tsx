import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Text } from "react-native";
import "../global.css";

export default function Layout() {
  // Carregar fonte Inter do Google Fonts
  const [loaded] = useFonts({
    Inter: require("@expo-google-fonts/inter"),
  });

  if (!loaded) {
    return <Text>Carregando...</Text>;
  }

  return <Stack />;
}
