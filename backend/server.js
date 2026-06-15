import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' })); // Vite default port
app.use(json());


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});