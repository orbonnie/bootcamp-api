import express, {Request, Response, NextFunction} from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import chalk from 'chalk';
import qs from 'qs';
// import {logger} from './middleware/logger';

dotenv.config({path: './config/config.env'});

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Connect to database
import connectDB from './config/db'
connectDB();

// Routes
import bootcamps from './routes/bootcamps';
import { errorHandler } from './middleware/error';

const app = express();

app.use(express.json());

app.set('query parser', (str: string) => qs.parse(str));

// Middleware
if(ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use(logger);

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler);

const server = app.listen(
  PORT,
  () => console.log(chalk.yellow.bold(`Server running in ${ENV} on port ${PORT}`))
);

// Catch promise rejections
process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
  console.log(chalk.red(`Error: ${err.message}`))
  console.log(`${err.stack}`);
  server.close(() => process.exit(1))
});


