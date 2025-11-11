import express from 'express';
import cors from "cors";
import { router as userRouter } from './routes/user.route.js';
import { router as postsRouter } from './routes/posts.route.js';
import { router as commentsRouter } from './routes/comments.route.js';
import { runDb } from './db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cors());
app.use(errorMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello world!!!');
});

app.use('/users', userRouter);
app.use('/posts', authMiddleware, postsRouter);
app.use('/comments', authMiddleware, commentsRouter);

const startApp = async () => {
  await runDb();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startApp();

export default app;
