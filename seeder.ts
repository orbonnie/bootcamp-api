import fs from 'fs';
import mongoose from 'mongoose';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config({path: './config/config.env'});

// Load models
import Bootcamp from './models/Bootcamp';
import Course from './models/Course';

// Connect to DB
mongoose.connect(process.env.MONGO_URI!);

// Read JSON
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));


// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);

    console.log(chalk.green.inverse('Data imported...'));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();

    console.log(chalk.red.inverse('Data deleted...'));
    process.exit(0);
  } catch (err) {
    console.error(err)
    process.exit(1);
  }
}

if(process.argv[2] === '-i') {
  importData();
}else if(process.argv[2] === '-d') {
  deleteData();
}
