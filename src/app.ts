import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import routes from './app/Router/index';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
const app: Application = express();

app.use(cors());

//parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// uploaded file/image
app.use('/uploads', express.static('./src/uploads'));

// Application routes
app.use('/api/v1', routes);

//Testing
app.get('/', async (req: Request, res: Response) => {
  res.send('Working Successfully');
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
