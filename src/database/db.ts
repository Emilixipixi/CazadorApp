import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

export const NOMBRE_BD = 'cazador.db';

export interface Registro {
  id: number;
  titulo: string;
  calificacion: number;
  comentarios: string;
  fotoBase64: string;
  fecha: string;
}

export const crearTabla = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      calificacion INTEGER NOT NULL,
      comentarios TEXT NOT NULL,
      fotoBase64 TEXT NOT NULL,
      fecha TEXT NOT NULL
    );
  `);
};

export const initDatabase = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync(NOMBRE_BD);
  try {
    await crearTabla(db);
  } finally {
    await db.closeAsync();
  }
};
