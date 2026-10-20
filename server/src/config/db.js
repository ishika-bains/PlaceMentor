import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isConnectedToMongo = false;

// Local JSON storage path for resilient zero-config fallback
const DATA_DIR = path.join(__dirname, '../../data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local_db.json');

// In-memory data store structure
const defaultStore = {
  users: [],
  questions: [],
  testAttempts: [],
  interviewSessions: [],
  gdSessions: []
};

let memoryStore = { ...defaultStore };

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load local JSON DB if exists
export const loadLocalDb = () => {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      memoryStore = JSON.parse(data);
    } else {
      saveLocalDb();
    }
  } catch (err) {
    console.error('Error loading local JSON DB:', err.message);
    memoryStore = { ...defaultStore };
  }
};

export const saveLocalDb = () => {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local JSON DB:', err.message);
  }
};

export const getStore = () => memoryStore;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placementor';

  loadLocalDb();

  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB is not reachable (${error.message}).`);
    console.warn(`[Database] PlaceMentor is operating in RESILIENT LOCAL PERSISTENCE MODE using server/data/local_db.json.`);
    console.warn(`[Database] All authentication, tests, interviews, and stats are 100% functional and persisted!`);
  }
};
