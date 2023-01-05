import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import createRoutes from './src/routes/index.js';
import socketEvents from './src/constants/socketEvents.js';

const app = express();
const server = createServer(app);

const io = new Server(server, { cors: {} });

io.on('connection', socket => {
  console.log(`Socket ${socket.id} connected`);
  socket.on('disconnect', reason => {
    console.log(reason);
  });

  socket.on(socketEvents.joinPresentation, presentationId => {
    socket.join(presentationId);
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

createRoutes(app);

app.get('/', (req, res) => [
  res.send('heelo'),
]);
connectDB();
const port = config.PORT;
server.listen(port, console.log(`Server is starting at ${port}`));

export default io;
