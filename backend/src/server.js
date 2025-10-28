import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import registrarRoutes from './routes/registrarRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import professorRoutes from './routes/professorRoutes.js';
import gradesRoutes from './routes/gradesRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/auth', authRoutes);
app.use('/roles', roleRoutes);
app.use('/registrar', registrarRoutes);
app.use('/admission', admissionRoutes);
app.use('/professor', professorRoutes);
app.use('/grades', gradesRoutes);
app.use('/analytics', analyticsRoutes);

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}

export default app;
