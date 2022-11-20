import express from 'express';
import bodyParser from 'body-parser';
import config from './src/configs/config.js';
import connectDB from './src/configs/db.js';
import createRoutes from './src/routes/index.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

createRoutes(app);
connectDB();
const port = config.PORT;
app.listen(port, console.log(`Server is starting at ${port}`));
