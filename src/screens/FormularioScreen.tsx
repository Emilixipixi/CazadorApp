import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colores } from '../theme/colores';

type Props = NativeStackScreenProps<RootStackParamList, 'Formulario'>;

export default function FormularioScreen({ navigation, route }: Props) {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  const idEdicion = route.params?.id;
  const tituloEdicion = route.params?.tituloActual || '';
  const califEdicion = route.params?.calificacionActual?.toString() || '';
  const comenEdicion = route.params?.comentariosActuales || '';

  const [titulo, setTitulo] = useState(tituloEdicion);
  const [calificacion, setCalificacion] = useState(califEdicion);
  const [comentarios, setComentarios] = useState(comenEdicion);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [cargandoFoto, setCargandoFoto] = useState(!!idEdicion);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarFoto = async () => {
      if (!idEdicion) return;
      try {
        const fila = await db.getFirstAsync<{ fotoBase64: string }>(
          'SELECT fotoBase64 FROM registros WHERE id = ?',
          idEdicion
        );
        if (fila) setFotoBase64(fila.fotoBase64);
      } catch (e) {
        Alert.alert('Error', 'No se pudo cargar la foto');
      } finally {
        setCargandoFoto(false);
      }
    };
    cargarFoto();
  }, [db, idEdicion]);

  const opcionesImagen: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.4,
    base64: true,
  };

  const procesarResultado = (resultado: ImagePicker.ImagePickerResult) => {
    if (!resultado.canceled && resultado.assets[0]?.base64) {
      setFotoBase64(resultado.assets[0].base64);
    }
  };

  const tomarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara');
        return;
      }
      procesarResultado(await ImagePicker.launchCameraAsync(opcionesImagen));
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const elegirDeGaleria = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
        return;
      }
      procesarResultado(await ImagePicker.launchImageLibraryAsync(opcionesImagen));
    } catch (e) {
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const guardar = async () => {
    const calificacionNumero = parseInt(calificacion, 10);

    if (!titulo.trim()) {
      Alert.alert('Falta información', 'Escribe el nombre del plato');
      return;
    }
    if (!calificacionNumero || calificacionNumero < 1 || calificacionNumero > 5) {
      Alert.alert('Falta información', 'Selecciona una calificación de 1 a 5 estrellas');
      return;
    }
    if (!comentarios.trim()) {
      Alert.alert('Falta información', 'Cuéntanos qué te pareció');
      return;
    }
    if (!fotoBase64) {
      Alert.alert('Falta información', 'Agrega una foto del plato');
      return;
    }

    setGuardando(true);
    try {
      const fecha = new Date().toISOString();
      if (idEdicion) {
        await db.runAsync(
          'UPDATE registros SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ?, fecha = ? WHERE id = ?',
          titulo.trim(),
          calificacionNumero,
          comentarios.trim(),
          fotoBase64,
          fecha,
          idEdicion
        );
      } else {
        await db.runAsync(
          'INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) VALUES (?, ?, ?, ?, ?)',
          titulo.trim(),
          calificacionNumero,
          comentarios.trim(),
          fotoBase64,
          fecha
        );
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    } finally {
      setGuardando(false);
    }
  };

  const calificacionActual = parseInt(calificacion, 10) || 0;

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.marcoFoto}>
          {cargandoFoto ? (
            <ActivityIndicator size="large" color={colores.primario} />
          ) : fotoBase64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${fotoBase64}` }}
              style={styles.foto}
            />
          ) : (
            <View style={styles.sinFoto}>
              <Ionicons name="image-outline" size={56} color={colores.textoSuave} />
              <Text style={styles.sinFotoTexto}>Sin foto todavía</Text>
            </View>
          )}
        </View>

        <View style={styles.filaBotonesFoto}>
          <TouchableOpacity style={styles.botonFoto} onPress={tomarFoto}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botonFoto, styles.botonGaleria]}
            onPress={elegirDeGaleria}
          >
            <Ionicons name="images" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.etiqueta}>Plato</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej: Encebollado de la esquina"
          placeholderTextColor={colores.textoSuave}
        />

        <Text style={styles.etiqueta}>Calificación</Text>
        <View style={styles.filaEstrellas}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setCalificacion(n.toString())}
              hitSlop={6}
            >
              <Ionicons
                name={n <= calificacionActual ? 'star' : 'star-outline'}
                size={38}
                color={colores.acento}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiqueta}>Comentarios</Text>
        <TextInput
          style={[styles.input, styles.inputMultilinea]}
          value={comentarios}
          onChangeText={setComentarios}
          placeholder="¿Qué tal estuvo? ¿Volverías?"
          placeholderTextColor={colores.textoSuave}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          disabled={guardando}
          activeOpacity={0.85}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={30} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  scroll: {
    padding: 20,
  },
  marcoFoto: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colores.tarjeta,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  sinFoto: {
    alignItems: 'center',
    gap: 6,
  },
  sinFotoTexto: {
    color: colores.textoSuave,
    fontWeight: '600',
  },
  filaBotonesFoto: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: -28,
    marginBottom: 12,
  },
  botonFoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colores.fondo,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  botonGaleria: {
    backgroundColor: colores.secundario,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: '800',
    color: colores.texto,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colores.texto,
  },
  inputMultilinea: {
    minHeight: 120,
  },
  filaEstrellas: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  botonGuardar: {
    marginTop: 28,
    height: 60,
    borderRadius: 30,
    backgroundColor: colores.exito,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colores.exito,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
