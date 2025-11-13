import express from 'express';
import cors from "cors";
import { runDb } from './db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { router as adminRouter } from './routes/admin.route.js';
import { router as clientRouter } from './routes/client.route.js';
import { router as serviceRouter } from './routes/service.route.js';
import { router as appointmentRouter } from './routes/appointment.route.js';
import { router as materialRouter } from './routes/material.route.js';
import { router as masterScheduleRouter } from './routes/masterSchedule.route.js';
import { router as scheduleExceptionRouter } from './routes/scheduleException.route.js';

const app = express();
const PORT = 3005;

app.use(express.json());
app.use(cors());
app.use(errorMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello world!!!');
});

app.use('/admins', adminRouter);
app.use('/clients', clientRouter);
app.use('/service', authMiddleware, serviceRouter);
app.use('/appointments', authMiddleware, appointmentRouter);
app.use('/materials', authMiddleware, materialRouter);
app.use('/schedule', authMiddleware, masterScheduleRouter);
app.use('/schedule-exceptions', authMiddleware, scheduleExceptionRouter);

const startApp = async () => {
  await runDb();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startApp();

export default app;
