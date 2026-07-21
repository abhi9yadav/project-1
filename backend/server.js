import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import { isEmailConfigured } from './utils/email.js';

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// Serve the built frontend if it exists (single-service deployment).
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback: send index.html for any non-API route.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('DSA Tracker API is running...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`  Email (SMTP): ${isEmailConfigured() ? 'CONFIGURED' : 'NOT configured — verification/reset links will be logged to console, and new accounts auto-verify'}`);
  console.log(`  Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED' : 'NOT configured'}`);
  console.log(`  Client URL:   ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
