import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;

    async init() {
        this.db = await SQLite.openDatabaseAsync('gemini_clinic.db');

        // Initialize tables
        await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS offline_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        body TEXT,
        createdAt INTEGER DEFAULT (unixepoch())
      );
      CREATE TABLE IF NOT EXISTS patient_cache (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        lastUpdated INTEGER DEFAULT (unixepoch())
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        timestamp INTEGER DEFAULT (unixepoch())
      );
    `);
        console.log("Database initialized");
    }

    // ... (queueAction, getQueuedActions, removeAction remain same)

    async queueAction(endpoint: string, method: string, body: any) {
        if (!this.db) await this.init();
        await this.db?.runAsync(
            'INSERT INTO offline_actions (endpoint, method, body) VALUES (?, ?, ?)',
            endpoint, method, JSON.stringify(body)
        );
    }

    async getQueuedActions() {
        if (!this.db) await this.init();
        return await this.db?.getAllAsync('SELECT * FROM offline_actions ORDER BY createdAt ASC');
    }

    async removeAction(id: number) {
        if (!this.db) await this.init();
        await this.db?.runAsync('DELETE FROM offline_actions WHERE id = ?', id);
    }

    // Secure Storage for API Keys or PHI tokens
    async saveSecure(key: string, value: string) {
        if (Platform.OS !== 'web') {
            await SecureStore.setItemAsync(key, value);
        }
    }

    async getSecure(key: string) {
        if (Platform.OS !== 'web') {
            return await SecureStore.getItemAsync(key);
        }
        return null;
    }

    // Patient Cache Methods
    async savePatient(patient: any) {
        if (!this.db) await this.init();
        // Encrypt sensitive name before storing? For demo, we store as JSON string
        await this.db?.runAsync(
            'INSERT OR REPLACE INTO patient_cache (id, data, lastUpdated) VALUES (?, ?, ?)',
            patient.id, JSON.stringify(patient), Math.floor(Date.now() / 1000)
        );
        this.logAction('PATIENT_SAVE', `Saved patient ${patient.id}`);
    }

    async getPatients() {
        if (!this.db) await this.init();
        const rows = await this.db?.getAllAsync('SELECT * FROM patient_cache ORDER BY lastUpdated DESC');
        return rows ? rows.map((r: any) => JSON.parse(r.data)) : [];
    }

    // Audit Log Methods
    async logAction(action: string, details: string) {
        if (!this.db) await this.init();
        await this.db?.runAsync(
            'INSERT INTO audit_logs (action, details, timestamp) VALUES (?, ?, ?)',
            action, details, Math.floor(Date.now() / 1000)
        );
    }

    async getAuditLogs() {
        if (!this.db) await this.init();
        return await this.db?.getAllAsync('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50');
    }
}

export const database = new DatabaseService();
