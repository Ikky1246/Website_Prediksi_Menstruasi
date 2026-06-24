import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { connectDB, DB } from './server/db.js';
import { generatePredictions } from './server/predictor.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_123';

app.use(express.json());

// Initialize DB connection
connectDB().then(async (success) => {
  if (success) {
    console.log('Database system initialized.');
  } else {
    console.log('Using local database storage engine.');
  }
  await seedUsers();
});

async function seedUsers() {
  try {
    const existing = await DB.users.find();
    if (existing.length === 0) {
      console.log('Seeding initial demo accounts...');
      
      const userHash = await bcrypt.hash('user123', 10);
      const adminHash = await bcrypt.hash('admin123', 10);

      // Seed normal user with some initial cycle settings and logs
      const demoUser = await DB.users.create({
        username: 'Sarah',
        email: 'user@siklusku.com',
        password: userHash,
        role: 'user',
        cycleSettings: {
          cycleLength: 28,
          periodLength: 5,
          lastPeriodStart: '2026-06-10', // 14 days ago
        },
        personalData: {
          name: 'Sarah Angelina',
          birthDate: '2000-05-15',
          weight: 54,
          height: 161,
        }
      });

      // Generate initial 6 predictions for demoUser
      const initialPredictions = generatePredictions('2026-06-10', 28, 5, 6);
      for (const pred of initialPredictions) {
        await DB.predictions.create({
          userId: demoUser._id,
          ...pred
        });
      }

      // Seed some journal entries for demoUser to show statistics/trends
      const mockLogs = [
        {
          userId: demoUser._id,
          date: '2026-06-10',
          mood: ['Sensitif/Moody', 'Lelah/Tidak Berenergi'],
          physicalSymptoms: ['Kram Perut', 'Sakit Kepala'],
          flowIntensity: 'heavy',
          notes: 'Hari pertama menstruasi. Perut terasa kram sekali.'
        },
        {
          userId: demoUser._id,
          date: '2026-06-11',
          mood: ['Lelah/Tidak Berenergi'],
          physicalSymptoms: ['Kram Perut', 'Kembung'],
          flowIntensity: 'medium',
          notes: 'Hari kedua haid, pendarahan lumayan sedang.'
        },
        {
          userId: demoUser._id,
          date: '2026-06-12',
          mood: ['Tenang'],
          physicalSymptoms: ['Nyeri Punggung Bawah'],
          flowIntensity: 'light',
          notes: 'Nyeri perut berkurang banyak.'
        },
        {
          userId: demoUser._id,
          date: '2026-06-13',
          mood: ['Bahagia/Senang'],
          physicalSymptoms: [],
          flowIntensity: 'spotting',
          notes: 'Hanya flek coklat sedikit.'
        }
      ];

      for (const log of mockLogs) {
        await DB.journal.create(log);
      }

      // Seed administrator
      await DB.users.create({
        username: 'AdminSiklus',
        email: 'admin@siklusku.com',
        password: adminHash,
        role: 'admin',
        cycleSettings: {
          cycleLength: 28,
          periodLength: 5,
          lastPeriodStart: '',
        },
        personalData: {
          name: 'Admin SiklusKu',
          birthDate: '',
        }
      });

      // Seed mock feedback
      await DB.feedback.create({
        email: 'user@siklusku.com',
        message: 'Aplikasi SiklusKu sangat bermanfaat! Fitur prediksi masa suburnya sangat membantu saya dalam merencanakan aktivitas olahraga mingguan.',
      });

      console.log('✅ Demo accounts seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ----------------------------------------------------
// Authentication Middleware
// ----------------------------------------------------

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = decoded as { id: string; email: string; role: string };
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required.' });
    return;
  }
  next();
};

// ----------------------------------------------------
// AUTHENTICATION API ROUTES
// ----------------------------------------------------

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    // Check if user already exists
    const existingUser = await DB.users.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered.' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default cycle settings and user creation
    const userRole = role === 'admin' ? 'admin' : 'user';
    const newUser = await DB.users.create({
      username,
      email,
      password: hashedPassword,
      role: userRole,
      cycleSettings: {
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: '',
      },
      personalData: {
        name: username,
        birthDate: '',
        weight: undefined,
        height: undefined,
      },
    });

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await DB.users.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        cycleSettings: user.cycleSettings,
        personalData: user.personalData,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ error: 'Email and new password are required.' });
      return;
    }

    const user = await DB.users.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'Email not found.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await DB.users.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ message: 'Password has been updated successfully. You can now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Get Me
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await DB.users.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      cycleSettings: user.cycleSettings,
      personalData: user.personalData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ----------------------------------------------------
// USER SETTINGS & CYCLES API ROUTES
// ----------------------------------------------------

// Update cycle settings and auto-generate predictions
app.put('/api/user/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cycleLength, periodLength, lastPeriodStart } = req.body;
    const userId = req.user!.id;

    if (!cycleLength || !periodLength || !lastPeriodStart) {
      res.status(400).json({ error: 'Please provide cycleLength, periodLength, and lastPeriodStart.' });
      return;
    }

    const updatedUser = await DB.users.findByIdAndUpdate(userId, {
      cycleSettings: {
        cycleLength: Number(cycleLength),
        periodLength: Number(periodLength),
        lastPeriodStart,
      },
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Auto-generate 6 months of predictions
    const predictionsList = generatePredictions(lastPeriodStart, Number(cycleLength), Number(periodLength), 6);

    // Delete existing predictions for this user
    await DB.predictions.deleteMany({ userId });

    // Store new predictions
    for (const pred of predictionsList) {
      await DB.predictions.create({
        userId,
        ...pred,
      });
    }

    res.json({
      message: 'Cycle settings updated and calendar predictions generated successfully!',
      user: {
        ...updatedUser,
        cycleSettings: {
          cycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
          lastPeriodStart,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Update personal profile data
app.put('/api/user/personal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, birthDate, weight, height } = req.body;
    const userId = req.user!.id;

    const updatedUser = await DB.users.findByIdAndUpdate(userId, {
      personalData: {
        name: name || '',
        birthDate: birthDate || '',
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
      },
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      message: 'Personal profile updated successfully!',
      user: {
        ...updatedUser,
        personalData: {
          name: name || '',
          birthDate: birthDate || '',
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Fetch predictions
app.get('/api/user/predictions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const list = await DB.predictions.find({ userId });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ----------------------------------------------------
// DAILY JOURNAL & SYMPTOMS LOGS API ROUTES
// ----------------------------------------------------

// Get all journal logs
app.get('/api/user/journal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const logs = await DB.journal.find({ userId });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Get journal entry for specific date (YYYY-MM-DD)
app.get('/api/user/journal/:date', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date } = req.params; // Expects YYYY-MM-DD
    const log = await DB.journal.findOne({ userId, date });
    if (!log) {
      res.json({
        userId,
        date,
        mood: [],
        physicalSymptoms: [],
        flowIntensity: 'none',
        notes: '',
      });
      return;
    }
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Log journal entry
app.post('/api/user/journal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, mood, physicalSymptoms, flowIntensity, notes } = req.body;

    if (!date) {
      res.status(400).json({ error: 'Date is required.' });
      return;
    }

    const updatedLog = await DB.journal.findOneAndUpdate(
      { userId, date },
      {
        mood: mood || [],
        physicalSymptoms: physicalSymptoms || [],
        flowIntensity: flowIntensity || 'none',
        notes: notes || '',
        loggedAt: new Date(),
      }
    );

    res.json({
      message: 'Daily health log saved successfully!',
      log: updatedLog,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Fetch period history (journal logs where flowIntensity !== 'none')
app.get('/api/user/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const logs = await DB.journal.find({ userId });
    const periodHistory = logs
      .filter((log) => log.flowIntensity && log.flowIntensity !== 'none')
      .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    res.json(periodHistory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ----------------------------------------------------
// FEEDBACK & MESSAGES API ROUTES
// ----------------------------------------------------

app.post('/api/user/feedback', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { email, message } = req.body;

    if (!email || !message) {
      res.status(400).json({ error: 'Email and message are required.' });
      return;
    }

    const fb = await DB.feedback.create({
      userId,
      email,
      message,
    });

    res.json({ message: 'Thank you for your feedback! It has been submitted to the admin.', feedback: fb });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ----------------------------------------------------
// ADMIN OPERATIONS API ROUTES
// ----------------------------------------------------

// Admin get users list
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await DB.users.find();
    // Return users without password field
    const sanitisedUsers = users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(sanitisedUsers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Admin create user
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, password, role, cycleLength, periodLength, lastPeriodStart } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email and password are required.' });
      return;
    }

    const existingUser = await DB.users.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await DB.users.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      cycleSettings: {
        cycleLength: Number(cycleLength || 28),
        periodLength: Number(periodLength || 5),
        lastPeriodStart: lastPeriodStart || '',
      },
      personalData: {
        name: username,
        birthDate: '',
      },
    });

    res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Admin update user
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, cycleSettings } = req.body;

    const user = await DB.users.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updatePayload: any = {};
    if (username) updatePayload.username = username;
    if (email) updatePayload.email = email;
    if (role) updatePayload.role = role;
    if (cycleSettings) {
      updatePayload.cycleSettings = {
        cycleLength: Number(cycleSettings.cycleLength || user.cycleSettings?.cycleLength || 28),
        periodLength: Number(cycleSettings.periodLength || user.cycleSettings?.periodLength || 5),
        lastPeriodStart: cycleSettings.lastPeriodStart || user.cycleSettings?.lastPeriodStart || '',
      };
    }

    const updated = await DB.users.findByIdAndUpdate(id, updatePayload);
    res.json({ message: 'User updated successfully.', user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Admin delete user
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await DB.users.findByIdAndDelete(id);
    if (!success) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// Admin dashboard stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await DB.users.find();
    const predictions = await DB.predictions.find();
    const journalEntries = await DB.journal.find();
    const feedbackList = await DB.feedback.find();

    const stats = {
      totalUsers: users.length,
      totalPredictions: predictions.length,
      totalJournalEntries: journalEntries.length,
      totalFeedback: feedbackList.length,
      recentUsers: users.slice(-5).reverse().map((u: any) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      recentFeedback: feedbackList.slice(-5).reverse(),
    };

    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
});

// ----------------------------------------------------
// STATIC SERVING & VITE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite development middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('📦 Production static file server activated.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server successfully launched on http://localhost:${PORT}`);
  });
}

startServer();
