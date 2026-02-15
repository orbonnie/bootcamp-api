import express, {Request, Response} from 'express';
import dotenv from 'dotenv';

// Routes
import bootcamps from './routes/bootcamps';

dotenv.config({path: './config/config.env'});

const app = express();

// Mount Routers

app.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 3000
const ENV = process.env.NODE_ENV || 'development'

app.listen(
    PORT,
    () => console.log(`Server running in ${ENV} on port ${PORT}`)
);
