'use client';
import { openDB, IDBPDatabase } from 'idb';

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

async function getIDB() {
  if (!dbPromise) {
    dbPromise = openDB('satLocalDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('jsonStore')) {
          db.createObjectStore('jsonStore');
        }
      },
    });
  }
  return dbPromise;
}
// Function to save data to IndexedDB
export async function saveJsonData(key: string, data: any) {
  const db = await getIDB();
  await db.delete('jsonStore', key);
  await db.put('jsonStore', data, key);
}

// Function to load data from IndexedDB
export async function loadJsonData(key: string) {
  const db = await getIDB();
  return await db.get('jsonStore', key);
}

export async function countJsonData(key: string) {
  const db = await getIDB();
  return await db.count('jsonStore', key);
}
