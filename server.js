const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Odoo Project</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2c3e50;
          text-align: center;
        }
        .status {
          background: #e8f5e8;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #27ae60;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Odoo Project</h1>
        <div class="status">
          <strong>Status:</strong> Server is running successfully!
        </div>
        <p>Welcome to your Odoo project. The development server is now working.</p>
        <p><strong>Server running on port:</strong> ${PORT}</p>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});