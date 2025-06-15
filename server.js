// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();}
const express = require('express');
const path = require('path');

const { createApp } = require('./server/index');  // import from server/index.js
const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port:${PORT}`);
  // ✅ Serve React static files *AFTER* all APIs
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
  
});

