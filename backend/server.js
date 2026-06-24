import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';

const app = express();
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));
app.use(json());
app.use(cookieParser());

// Auth API routing
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/hospitals', hospitalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
