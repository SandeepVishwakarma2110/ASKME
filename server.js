require('dotenv').config();

const { createApp } = require('./server/index');  // import from server/index.js
const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port:${PORT}`);
});

