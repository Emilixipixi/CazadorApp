# 🍽️ Cazador de Sabores

App 100% offline con Expo + TypeScript + SQLite para registrar platos con foto, calificación y comentarios (CRUD completo).

## Tecnologías
- Expo SDK 57 + TypeScript
- expo-sqlite (SQLiteProvider + useSQLiteContext)
- expo-image-picker (cámara y galería en Base64)
- React Navigation (Native Stack)

## Instalación
```bash
npm install
npx expo start
```
Escanea el QR con Expo Go.

## Estructura
```
CazadorApp/
├── App.tsx
├── src/
│   ├── database/db.ts
│   ├── screens/
│   │   ├── ListaScreen.tsx
│   │   └── FormularioScreen.tsx
│   ├── theme/colores.ts
│   └── navigation.ts
```
