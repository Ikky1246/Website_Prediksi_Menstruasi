import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load env variables
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists for the JSON-fallback database
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check if mongoose is connected
export let isConnectedToMongo = false;

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables.');
    console.warn('🚀 Falling back to JSON file-based database for live preview persistence!');
    return false;
  }

  if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>')) {
    console.warn('⚠️ MONGODB_URI contains password placeholder <db_password> or <password>.');
    console.warn('🚀 Please replace it with your actual database password. Falling back to JSON database files.');
    return false;
  }

  try {
    // Attempt connection with timeout so it doesn't hang forever
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnectedToMongo = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    console.warn('🚀 Falling back to JSON file-based database for live preview persistence!');
    isConnectedToMongo = false;
    return false;
  }
}

// ----------------------------------------------------
// Mongoose Schema Definitions
// ----------------------------------------------------

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  cycleSettings: {
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    lastPeriodStart: { type: String, default: '' }, // YYYY-MM-DD
  },
  personalData: {
    name: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    weight: { type: Number },
    height: { type: Number },
  },
});

const PredictionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cycleStartDate: { type: String, required: true },
  cycleEndDate: { type: String, required: true },
  ovulationDate: { type: String, required: true },
  fertileWindowStart: { type: String, required: true },
  fertileWindowEnd: { type: String, required: true },
  periodDuration: { type: Number, required: true },
  predictedAt: { type: Date, default: Date.now },
});

const JournalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  mood: { type: [String], default: [] },
  physicalSymptoms: { type: [String], default: [] },
  flowIntensity: { type: String, enum: ['light', 'medium', 'heavy', 'spotting', 'none'], default: 'none' },
  notes: { type: String, default: '' },
  loggedAt: { type: Date, default: Date.now },
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compile Mongoose Models
export const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
export const MongoPrediction = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
export const MongoJournal = mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
export const MongoFeedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

// ----------------------------------------------------
// Local File Database Helper (Fallback)
// ----------------------------------------------------

export class LocalDB {
  private static getFilePath(collectionName: string) {
    return path.join(DATA_DIR, `${collectionName}.json`);
  }

  private static readCollection(collectionName: string): any[] {
    const filePath = this.getFilePath(collectionName);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private static writeCollection(collectionName: string, data: any[]) {
    const filePath = this.getFilePath(collectionName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Generic operations
  static async find(collection: string, query: any = {}): Promise<any[]> {
    const data = this.readCollection(collection);
    return data.filter((item) => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  static async findOne(collection: string, query: any = {}): Promise<any | null> {
    const results = await this.find(collection, query);
    return results.length > 0 ? results[0] : null;
  }

  static async create(collection: string, payload: any): Promise<any> {
    const data = this.readCollection(collection);
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    data.push(newItem);
    this.writeCollection(collection, data);
    return newItem;
  }

  static async findByIdAndUpdate(collection: string, id: string, updatePayload: any): Promise<any | null> {
    const data = this.readCollection(collection);
    const index = data.findIndex((item) => item._id === id);
    if (index === -1) return null;

    // Support nested merge for cycleSettings and personalData
    const current = data[index];
    const updated = { ...current };

    for (const key in updatePayload) {
      if (typeof updatePayload[key] === 'object' && updatePayload[key] !== null && !Array.isArray(updatePayload[key])) {
        updated[key] = { ...updated[key], ...updatePayload[key] };
      } else {
        updated[key] = updatePayload[key];
      }
    }

    data[index] = updated;
    this.writeCollection(collection, data);
    return updated;
  }

  static async findByIdAndDelete(collection: string, id: string): Promise<boolean> {
    const data = this.readCollection(collection);
    const filtered = data.filter((item) => item._id !== id);
    if (data.length === filtered.length) return false;
    this.writeCollection(collection, filtered);
    return true;
  }
}

// ----------------------------------------------------
// Unified Database Access Layer (Switches dynamically)
// ----------------------------------------------------

export const DB = {
  users: {
    async find(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoUser.find(query).lean();
      }
      return LocalDB.find('users', query);
    },
    async findOne(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoUser.findOne(query).lean();
      }
      return LocalDB.findOne('users', query);
    },
    async findById(id: string) {
      if (isConnectedToMongo) {
        return (MongoUser as any).findById(id).lean();
      }
      return LocalDB.findOne('users', { _id: id });
    },
    async create(payload: any) {
      if (isConnectedToMongo) {
        const user = new MongoUser(payload);
        const saved = await user.save();
        return saved.toObject();
      }
      return LocalDB.create('users', payload);
    },
    async findByIdAndUpdate(id: string, update: any) {
      if (isConnectedToMongo) {
        return (MongoUser as any).findByIdAndUpdate(id, update, { new: true }).lean();
      }
      return LocalDB.findByIdAndUpdate('users', id, update);
    },
    async findByIdAndDelete(id: string) {
      if (isConnectedToMongo) {
        const res = await (MongoUser as any).findByIdAndDelete(id);
        return !!res;
      }
      return LocalDB.findByIdAndDelete('users', id);
    },
  },

  predictions: {
    async find(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoPrediction.find(query).lean();
      }
      return LocalDB.find('predictions', query);
    },
    async findOne(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoPrediction.findOne(query).lean();
      }
      return LocalDB.findOne('predictions', query);
    },
    async create(payload: any) {
      if (isConnectedToMongo) {
        const pred = new MongoPrediction(payload);
        const saved = await pred.save();
        return saved.toObject();
      }
      return LocalDB.create('predictions', payload);
    },
    async deleteMany(query: any) {
      if (isConnectedToMongo) {
        return MongoPrediction.deleteMany(query);
      }
      const data = await LocalDB.find('predictions');
      const filtered = data.filter((item) => {
        for (const key in query) {
          if (item[key] !== query[key]) return true;
        }
        return false;
      });
      // Save
      const filePath = path.join(DATA_DIR, 'predictions.json');
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf-8');
      return { deletedCount: data.length - filtered.length };
    },
  },

  journal: {
    async find(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoJournal.find(query).lean();
      }
      return LocalDB.find('journal', query);
    },
    async findOne(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoJournal.findOne(query).lean();
      }
      return LocalDB.findOne('journal', query);
    },
    async create(payload: any) {
      if (isConnectedToMongo) {
        const j = new MongoJournal(payload);
        const saved = await j.save();
        return saved.toObject();
      }
      return LocalDB.create('journal', payload);
    },
    async findOneAndUpdate(query: any, update: any) {
      if (isConnectedToMongo) {
        return MongoJournal.findOneAndUpdate(query, update, { new: true, upsert: true }).lean();
      }
      const existing = await LocalDB.findOne('journal', query);
      if (existing) {
        return LocalDB.findByIdAndUpdate('journal', existing._id, update);
      } else {
        return LocalDB.create('journal', { ...query, ...update });
      }
    },
    async deleteOne(query: any) {
      if (isConnectedToMongo) {
        return MongoJournal.deleteOne(query);
      }
      const existing = await LocalDB.findOne('journal', query);
      if (existing) {
        return LocalDB.findByIdAndDelete('journal', existing._id);
      }
      return false;
    },
  },

  feedback: {
    async find(query: any = {}) {
      if (isConnectedToMongo) {
        return MongoFeedback.find(query).lean();
      }
      return LocalDB.find('feedback', query);
    },
    async create(payload: any) {
      if (isConnectedToMongo) {
        const fb = new MongoFeedback(payload);
        const saved = await fb.save();
        return saved.toObject();
      }
      return LocalDB.create('feedback', payload);
    },
  },
};
