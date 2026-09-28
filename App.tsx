import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase, NOMBRE_BD } from './src/database/db';
import ListaScreen from './src/screens/ListaScreen';
import FormularioScreen from './src/screens/FormularioScreen';
import { colores } from './src/theme/colores';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preparar = async () => {
      try {
        await initDatabase();
      } catch (e) {
        setError('No se pudo inicializar la base de datos');
      } finally {
        setCargando(false);
      }
    };
    preparar();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <Text style={styles.logo}>🍽️</Text>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoCarga}>Preparando tu libreta de sabores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.logo}>⚠️</Text>
        <Text style={styles.textoCarga}>{error}</Text>
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName={NOMBRE_BD}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colores.primario },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: '800' },
              contentStyle: { backgroundColor: colores.fondo },
            }}
          >
            <Stack.Screen
              name="Lista"
              component={ListaScreen}
              options={{ title: 'Cazador de Sabores' }}
            />
            <Stack.Screen
              name="Formulario"
              component={FormularioScreen}
              options={({ route }) => ({
                title: route.params?.id ? '✏️ Sabor' : '➕ Sabor',
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    gap: 16,
  },
  logo: {
    fontSize: 64,
  },
  textoCarga: {
    color: colores.textoSuave,
    fontSize: 16,
    fontWeight: '600',
  },
});
