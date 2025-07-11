import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './api/auth.routes';
import userRoutes from './api/user.routes';
import forgeRoutes from './api/forge.routes';
import crucibleRoutes from './api/crucible.routes';
import knowledgeBaseRoutes from './api/knowledgeBase.routes';
import User from './models/user.model';

// Import all models to ensure they are registered with Mongoose
import './models/crucibleProblem.model';
import './models/crucibleSolution.model';
import './models/solutionDraft.model';
import './models/crucibleNote.model';
import './models/aiChatHistory.model';
import './models/workspaceState.model';
import './models/crucibleDiagram.model';
import './models/progressTracking.model';
import './models/researchItem.model';
import './models/knowledgeBaseDocument.model';

import bcrypt from 'bcryptjs';
import errorHandler from './middleware/error.middleware';

dotenv.config();

const app = express();

const setupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not found in .env, skipping admin setup.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const newAdmin = new User({
      email: adminEmail,
      password: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
    });

    await newAdmin.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
};

// Connect to database
connectDB().then(() => {
    setupAdmin();
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forge', forgeRoutes);
app.use('/api/crucible', crucibleRoutes);
app.use('/api/admin/knowledge-base/documents', knowledgeBaseRoutes);

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Admin Backend is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error Handler Middleware - Must be last
app.use(errorHandler); 