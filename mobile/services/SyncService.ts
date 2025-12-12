import * as Network from 'expo-network';
import { database } from './Database';
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
    ? 'http://10.11.178.99:3000'
    : 'http://localhost:3000';

class SyncService {
    private isSyncing = false;

    constructor() {
        this.startSyncLoop();
    }

    private startSyncLoop() {
        // Simple polling every 30 seconds to check for connectivity and sync
        setInterval(() => {
            this.sync();
        }, 30000);
    }

    async checkConnectivity() {
        try {
            const status = await Network.getNetworkStateAsync();
            return status.isConnected && status.isInternetReachable;
        } catch (e) {
            return false;
        }
    }

    // New method to wrap API calls with offline resilience
    async executeOrQueue(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', body: any) {
        const connected = await this.checkConnectivity();

        if (connected) {
            try {
                const response = await axios({
                    method,
                    url: `${API_URL}${endpoint}`,
                    data: body
                });
                return { success: true, data: response.data };
            } catch (error: any) {
                console.log("Online request failed, queuing...", error.message);
                if (error.response) {
                    console.log("Server responded with:", error.response.status, error.response.data);
                }
                // Fallthrough to queue if network error (not 4xx/5xx logic for simplicity here, but ideally differentiate)
                // For now, if it fails, we queue it to be safe.
                await database.queueAction(endpoint, method, body);
                return { success: false, queued: true };
            }
        } else {
            console.log("Offline, queuing action...");
            await database.queueAction(endpoint, method, body);
            return { success: false, queued: true };
        }
    }

    async sync() {
        if (this.isSyncing) return;

        const connected = await this.checkConnectivity();
        if (!connected) return;

        this.isSyncing = true;
        try {
            const actions = await database.getQueuedActions() as { id: number; endpoint: string; method: string; body: string }[];

            if (actions.length > 0) {
                console.log(`Syncing ${actions.length} offline actions...`);
            }

            for (const action of actions) {
                try {
                    console.log(`Replaying action ${action.id}: ${action.method} ${action.endpoint}`);
                    await axios({
                        method: action.method,
                        url: `${API_URL}${action.endpoint}`,
                        data: JSON.parse(action.body)
                    });
                    // If successful, remove from queue
                    await database.removeAction(action.id);
                } catch (e) {
                    console.error("Sync failed for action", action.id, e);
                    // Keep in queue to retry later
                }
            }
        } catch (e) {
            console.error("Sync error", e);
        } finally {
            this.isSyncing = false;
        }
    }
}

export const syncService = new SyncService();
