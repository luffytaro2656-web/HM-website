const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Vite default port
app.use(express.json());


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});