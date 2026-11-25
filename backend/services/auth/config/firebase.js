import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

let appInstance = null;

try {
    if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
        appInstance = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        console.warn("[AUTH WARNING] serviceAccountKey.json not found. Place your Firebase serviceAccountKey.json in backend/services/auth to verify ID tokens.");
        appInstance = admin.initializeApp({
            projectId: "cortexai-676f1"
        });
    }
} catch (error) {
    console.error("[AUTH ERROR] Firebase initialization error:", error.message);
    try {
        appInstance = admin.app();
    } catch {
        appInstance = admin.initializeApp({
            projectId: "cortexai-676f1"
        });
    }
}

export const app = appInstance;
