import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connect } from './data/dbConnection';
import { userRouter } from './routes/userRoute';
import profileRouter from './routes/profileRoute';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();
const port = Number(process.env['PORT']) || 1408;

// Middleware
app.use(express.json());

// В api-server.ts
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

// Статические файлы Angular
app.use('/', express.static('dist/traningsaventyr'));

// API маршруты
app.use('/api/users', userRouter);
app.use('/api/profiles', profileRouter);

// MongoDB connection
connect()
  .then(() => {
    console.log('MongoDB успешно подключена');
  })
  .catch((error: Error) => {
    console.error('Ошибка подключения к MongoDB:', error);
    // В production лучше не завершать процесс при ошибке подключения
    // process.exit(1);
  });

// Важно: обработка всех остальных маршрутов должна быть после API маршрутов
// Это перенаправляет все запросы на Angular приложение
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist/traningsaventyr/index.html'));
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${port}`);
});
