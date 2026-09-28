import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Registro } from '../database/db';
import type { RootStackParamList } from '../navigation';
import { colores } from '../theme/colores';

type Props = NativeStackScreenProps<RootStackParamList, 'Lista'>;

const formatearFecha = (iso: string) => {
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Estrellas = ({ valor }: { valor: number }) => (
  <View style={styles.estrellas}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Ionicons
        key={n}
        name={n <= valor ? 'star' : 'star-outline'}
        size={16}
        color={colores.acento}
      />
    ))}
  </View>
);

export default function ListaScreen({ navigation }: Props) {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [registros, setRegistros] = useState<Registro[]>([]);

  const listar = useCallback(async () => {
    try {
      const resultado = await db.getAllAsync<Registro>(
        'SELECT * FROM registros ORDER BY id DESC'
      );
      setRegistros(resultado);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los registros');
    }
  }, [db]);

  useEffect(() => {
    const suscripcion = navigation.addListener('focus', () => {
      listar();
    });
    return suscripcion;
  }, [navigation, listar]);

  const eliminar = (registro: Registro) => {
    Alert.alert('🗑️', `¿Eliminar "${registro.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM registros WHERE id = ?', registro.id);
            await listar();
          } catch (e) {
            Alert.alert('Error', 'No se pudo eliminar el registro');
          }
        },
      },
    ]);
  };

  const irAEditar = (registro: Registro) => {
    navigation.navigate('Formulario', {
      id: registro.id,
      tituloActual: registro.titulo,
      calificacionActual: registro.calificacion,
      comentariosActuales: registro.comentarios,
    });
  };

  const renderizarItem = ({ item }: { item: Registro }) => (
    <View style={styles.tarjeta}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.fotoBase64}` }}
        style={styles.foto}
      />
      <View style={styles.contenido}>
        <View style={styles.filaSuperior}>
          <Text style={styles.titulo} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
        </View>
        <Estrellas valor={item.calificacion} />
        <Text style={styles.comentarios} numberOfLines={3}>
          {item.comentarios}
        </Text>
        <View style={styles.acciones}>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEditar]}
            onPress={() => irAEditar(item)}
          >
            <Ionicons name="pencil" size={18} color={colores.secundario} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => eliminar(item)}
          >
            <Ionicons name="trash" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderizarItem}
        contentContainerStyle={[
          styles.lista,
          { paddingBottom: 110 + insets.bottom },
          registros.length === 0 && styles.listaVacia,
        ]}
        ListHeaderComponent={
          registros.length > 0 ? (
            <Text style={styles.encabezado}>
              {registros.length} {registros.length === 1 ? 'sabor cazado' : 'sabores cazados'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioEmoji}>🍜</Text>
            <Text style={styles.vacioTitulo}>Aún no has cazado sabores</Text>
            <Text style={styles.vacioTexto}>
              Toca el botón para registrar tu primer plato
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Formulario')}
      >
        <Ionicons name="add" size={34} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: 16,
    gap: 14,
  },
  listaVacia: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  encabezado: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.borde,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  foto: {
    width: '100%',
    height: 180,
    backgroundColor: colores.borde,
  },
  contenido: {
    padding: 14,
    gap: 6,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: colores.texto,
  },
  fecha: {
    fontSize: 12,
    color: colores.textoSuave,
    fontWeight: '600',
  },
  estrellas: {
    flexDirection: 'row',
    gap: 2,
  },
  comentarios: {
    fontSize: 14,
    color: colores.textoSuave,
    lineHeight: 20,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  botonAccion: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEditar: {
    backgroundColor: '#FDE9C4',
  },
  botonEliminar: {
    backgroundColor: colores.peligro,
  },
  vacio: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  vacioEmoji: {
    fontSize: 72,
  },
  vacioTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colores.texto,
  },
  vacioTexto: {
    fontSize: 15,
    color: colores.textoSuave,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colores.primarioOscuro,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
