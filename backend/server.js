import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tripRoutes from './routes/trip.js';
import { startVisionLoop } from './services/agentOrchestrator.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/trip', tripRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TravelAgent API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// WebSocket server for Vision-Action stream
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('🔌 Client connected to Vision-Action stream');
  let agentSignal = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'START_AGENT') {
        console.log(`🤖 Agent started with goal: ${message.goal}`);
        agentSignal = { stopped: false };
        startVisionLoop(ws, message.goal, agentSignal).catch((err) => {
          console.error('Vision loop failed:', err);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'ERROR', text: err.message }));
          }
        });
      } else if (message.type === 'STOP_AGENT') {
        console.log('🛑 Stop requested by user');
        if (agentSignal) agentSignal.stopped = true;

      // ── User browser interactions ──
      } else if (message.type === 'USER_CLICK' && agentSignal?.browser) {
        agentSignal.browser.executeAction({ type: 'click', x: message.x, y: message.y })
          .then(() => console.log(`🖱️ User click at (${message.x}, ${message.y})`))
          .catch((e) => console.warn('User click failed:', e.message));
      } else if (message.type === 'USER_TYPE' && agentSignal?.browser) {
        agentSignal.browser.executeAction({ type: 'type', text: message.text })
          .then(() => console.log(`⌨️ User typed: ${message.text}`))
          .catch((e) => console.warn('User type failed:', e.message));
      } else if (message.type === 'USER_KEY' && agentSignal?.browser) {
        const keyAction = message.key === 'Enter' ? { type: 'enter' } : { type: 'type', text: '' };
        agentSignal.browser.executeAction(keyAction)
          .then(() => console.log(`⌨️ User key: ${message.key}`))
          .catch((e) => console.warn('User key failed:', e.message));
      } else if (message.type === 'USER_SCROLL' && agentSignal?.browser) {
        agentSignal.browser.executeAction({ type: 'scroll', direction: message.direction || 'down' })
          .then(() => console.log(`🔃 User scroll ${message.direction}`))
          .catch((e) => console.warn('User scroll failed:', e.message));
      } else if (message.type === 'USER_BACK' && agentSignal?.browser) {
        agentSignal.browser.executeAction({ type: 'back' })
          .then(() => console.log('◀ User back'))
          .catch((e) => console.warn('User back failed:', e.message));
      } else if (message.type === 'USER_GOTO' && agentSignal?.browser) {
        agentSignal.browser.executeAction({ type: 'goto', url: message.url })
          .then(() => console.log(`🔗 User goto: ${message.url}`))
          .catch((e) => console.warn('User goto failed:', e.message));
      } else if (message.type === 'USER_SCREENSHOT' && agentSignal?.browser) {
        agentSignal.browser.captureScreenshot()
          .then((data) => {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({ type: 'SCREENSHOT', data }));
            }
          })
          .catch((e) => console.warn('User screenshot failed:', e.message));
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected from Vision-Action stream');
    if (agentSignal) agentSignal.stopped = true;
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 TravelAgent API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server listening on ws://localhost:${PORT}`);
});

export default app;
