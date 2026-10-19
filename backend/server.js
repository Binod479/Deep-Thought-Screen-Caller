require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabaseHelper = require('./lib/supabase');
const callsRouter = require('./routes/calls');
const llmRouter = require('./routes/llm');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend on Vercel or localhost
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key', 'x-groq-key']
}));

app.use(express.json());

// Request logging for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Render Health Endpoint (REQUIRED BY SPEC)
// "one health endpoint. Free tier; it sleeps when idle, which is fine. The Render health endpoint: One URL that answers when the backend is up. In the README"
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Meridian Cold Call Screen Backend',
    message: 'Backend is awake and operational on Render free tier',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    supabaseConnected: supabaseHelper.isConfigured(),
    llmProvider: process.env.GROQ_API_KEY ? 'Groq (llama-3.3-70b)' :
                 process.env.GEMINI_API_KEY ? 'Google Gemini 2.0 Flash' :
                 'Transcript-Grounded Heuristic Fallback'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Meridian Cold Call Screen Backend',
    message: 'Backend is awake and operational on Render free tier',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    supabaseConnected: supabaseHelper.isConfigured()
  });
});

// API Routes
app.use('/api', callsRouter);
app.use('/api/llm', llmRouter);

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Meridian Cold Call API</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #0F172A; color: white;">
        <h1 style="color: #38BDF8;">Meridian Growth Partners · Cold Call Screen API</h1>
        <p>Live backend service running on Render Free Tier.</p>
        <p><strong>Health Endpoint:</strong> <a href="/health" style="color: #60A5FA;">/health</a></p>
        <p><strong>List Calls:</strong> <a href="/api/calls" style="color: #60A5FA;">/api/calls</a></p>
        <p><strong>Stages Reference:</strong> <a href="/api/stages" style="color: #60A5FA;">/api/stages</a></p>
      </body>
    </html>
  `);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Meridian Cold Call Backend running on port ${PORT}`);
  console.log(`🩺 Health check URL: http://localhost:${PORT}/health`);
  console.log(`📦 Supabase mode: ${supabaseHelper.isConfigured() ? 'Connected' : 'In-Memory with seed data'}`);
});
