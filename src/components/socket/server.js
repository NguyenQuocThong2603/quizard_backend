import { Server } from 'socket.io';
import socketEvents from '../../constants/socketEvents.js';
import config from '../../config/config.js';

const io = new Server(config.SOCKET_PORT, { cors: {} });

io.on('connection', socket => {
  console.log(`Socket ${socket.id} connected`);
  socket.on('disconnect', reason => {
    console.log(reason);
  });

  socket.on(socketEvents.joinPresentation, presentationId => {
    socket.join(presentationId);
  });
});
console.log(`Socket server initiated at ${config.SOCKET_PORT}`);

export default io;
