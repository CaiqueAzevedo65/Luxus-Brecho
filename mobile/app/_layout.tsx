import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Text } from "react-native";

export default function Layout() {
  // Carregar fonte padrão do sistema (sem arquivo extra)
  const [loaded] = useFonts({
    // Usa a fonte padrão "System"
    SpaceMono: require("react-native/Libraries/Fonts/Roboto.ttf"),
  });

  if (!loaded) {
    return <Text>Carregando...</Text>;
  }

  return <Stack />;
}
