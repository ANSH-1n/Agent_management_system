import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import agentRoutes from './routes/agent.routes.js';
import listRoutes from './routes/list.routes.js';
import errorHandler from './middleware/errorMiddleware.js'; 
import path from 'path';
import whatsappRoutes from './routes/whatsappRoutes.js'; 



dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }));
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);  
app.use('/api/agents', agentRoutes);
app.use('/api/lists', listRoutes);

app.use('/api/whatsapp', whatsappRoutes);



// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
