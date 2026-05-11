import { openDB, type IDBPDatabase } from 'idb';
import type { OfflineAction } from '@/types';

const DB_NAME = 'aethlife-offline';
const DB_VERSION = 1;
const STORE_NAME = 'offline_actions';

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced');
        store.createIndex('type', 'type');
        store.createIndex('created_at', 'created_at');
      }
    },
  });

  return dbInstance;
}

export async function saveOfflineAction(
  action: Omit<OfflineAction, 'id' | 'created_at' | 'synced'>
): Promise<OfflineAction> {
  const db = await getDB();
  const entry: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    synced: false,
  };

  await db.put(STORE_NAME, entry);
  return entry;
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'synced', IDBKeyRange.only(false));
  return all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function markActionSynced(id: string): Promise<void> {
  const db = await getDB();
  const action = await db.get(STORE_NAME, id);
  if (action) {
    await db.put(STORE_NAME, { ...action, synced: true });
  }
}

export async function deleteAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearSyncedActions(): Promise<void> {
  const db = await getDB();
  const synced = await db.getAllFromIndex(STORE_NAME, 'synced', IDBKeyRange.only(true));
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all(synced.map((a) => tx.store.delete(a.id)));
  await tx.done;
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return db.countFromIndex(STORE_NAME, 'synced', IDBKeyRange.only(false));
}
