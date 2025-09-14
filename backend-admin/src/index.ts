import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { validateAndLogConfiguration } from './utils/configValidator';
import { logger } from './utils/logger';
import userRoutes from './api/user.routes';
import forgeRoutes from './api/forge.routes';
import crucibleRoutes from './api/crucible.routes';
import knowledgeBaseRoutes from './api/knowledgeBase.routes';
import arenaChannelRoutes from './api/arenaChannel.routes';
import notificationRoutes from './api/notification.routes';
import dashboardRoutes from './api/dashboard.routes';
import uploadRoutes from './api/upload.routes';
import errorHandler from './middleware/error.middleware';

// Import all models to ensure they are registered with Mongoose
import './models/user.model';
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
import './models/notification.model';

dotenv.config();

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/forge', forgeRoutes);
app.use('/api/crucible', crucibleRoutes);
app.use('/api/admin/knowledge-base/documents', knowledgeBaseRoutes);
app.use('/api', arenaChannelRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('Admin Backend is running...');
});

app.listen(PORT, async () => {
    logger.info(`Server starting on port ${PORT}`, {
        operation: 'server_startup',
        port: PORT,
        nodeEnv: process.env.NODE_ENV
    });

    // Validate configuration
    const configValid = await validateAndLogConfiguration();
    if (!configValid) {
        logger.error('Configuration validation failed. Some features may not work properly.', {
            operation: 'server_startup'
        });
    }

    logger.info(`Server is running successfully on port ${PORT}`, {
        operation: 'server_startup',
        port: PORT,
        configValid
    });
});

// Error Handler Middleware - Must be last
app.use(errorHandler); 