import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Proxy online' });
});

// Claude API proxy
app.post('/api/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy relay failed',
      message: error.message 
    });
  }
});

// Exercise image proxy — attaches RapidAPI auth headers so GIFs load in the browser
app.get('/api/exercise-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url param');
  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'x-rapidapi-key': process.env.VITE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      }
    });
    if (!response.ok) return res.status(response.status).send('Image fetch failed');
    const contentType = response.headers.get('content-type') || 'image/gif';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.body.pipe(res);
  } catch {
    res.status(500).send('Image proxy error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 SetLogic proxy running on http://localhost:${PORT}`);
  console.log(`✓ CORS enabled for http://localhost:5173`);
});