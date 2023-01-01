import { Server } from 'socket.io';
import socketEvents from '../../constants/socketEvents.js';

const io = new Server(5000, { cors: {} });

io.on('connection', socket => {
  console.log(`Socket ${socket.id} connected`);
  socket.on("disconnect", (reason) => {
    console.log(reason);
  });

  socket.on(socketEvents.joinPresentation, (presentationId) => {
    socket.join(presentationId);
  })
});
console.log('Socket server initiated');

export default io;
