
import { Document, Folder, AuditLog, User, SystemSetting } from './types';

const DB_NAME = 'YTWSE_DMS_OfflineDB';
const DB_VERSION = 3;

export class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const stores = ['documents', 'folders', 'auditLogs', 'users', 'settings'];
        stores.forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async getStore(name: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(name, mode);
    return transaction.objectStore(name);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async save<T>(storeName: string, item: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const stores = ['documents', 'folders', 'auditLogs', 'users', 'settings'];
    for (const name of stores) {
      const store = await this.getStore(name, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  }

  async exportDatabase(): Promise<string> {
    const data = {
      documents: await this.getAll<Document>('documents'),
      folders: await this.getAll<Folder>('folders'),
      auditLogs: await this.getAll<AuditLog>('auditLogs'),
      users: await this.getAll<User>('users'),
      settings: await this.getAll<SystemSetting>('settings'),
      exportDate: new Date().toISOString(),
      system: 'YTWSE-DMS',
      version: DB_VERSION
    };
    // Update last backup timestamp
    await this.save('settings', { id: 'last_backup', value: data.exportDate });
    return JSON.stringify(data, null, 2);
  }

  async importDatabase(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    if (data.system !== 'YTWSE-DMS') throw new Error('Invalid backup file');

    await this.clearAll();

    const collections = {
      documents: data.documents,
      folders: data.folders,
      auditLogs: data.auditLogs,
      users: data.users,
      settings: data.settings
    };

    for (const [storeName, items] of Object.entries(collections)) {
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await this.save(storeName, item);
        }
      }
    }
  }
}

export const db = new OfflineDB();
