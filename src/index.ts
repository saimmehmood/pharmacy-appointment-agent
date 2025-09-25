import express from 'express';
import dotenv from 'dotenv';
import retellRouter from './routes/retell.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/retell', retellRouter);
app.use('/chat', chatRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${port}`);
});


