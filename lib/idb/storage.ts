import { openDB } from 'idb';

// Open or create a database
const dbPromise = openDB('satLocalDB', 1, {
  upgrade(db) {
    db.createObjectStore('jsonStore');
  },
});

// Function to save data to IndexedDB
export async function saveJsonData(key: string, data: any) {
  const db = await dbPromise;
  await db.delete('jsonStore', key);
  await db.put('jsonStore', data, key);
}

// Function to load data from IndexedDB
export async function loadJsonData(key: string) {
  const db = await dbPromise;
  return await db.get('jsonStore', key);
}
