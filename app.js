import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import createRoutes from './src/routes/index.js';
import io from './src/components/socket/server.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello');
});

createRoutes(app);
connectDB();
const port = config.PORT;
app.listen(port, console.log(`Server is starting at ${port}`));
