import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Página não encontrada</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar para a página inicial</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#E91E63',
    fontSize: 16,
    textDecorationLine: 'underline'
  }
});
