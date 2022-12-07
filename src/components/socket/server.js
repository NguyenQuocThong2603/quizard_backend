import { Server } from 'socket.io';
const io = new Server(5000, { cors: {} });

io.on("connection", (socket) => {
  socket.on("disconnecting", (reason) => {
    console.log("Rooms", socket.rooms); // Set { ... }
  });

  socket.on("livePresentation", (data) => {
    console.log(data);
  });
  socket.on("joinPresentation", (presentationId) => {
    socket.join(presentationId);
    console.log(socket.id + " Joined " + presentationId);
  });
  socket.on("slideUpdate", (presentationId, slide) => {
    io.to(presentationId).emit("slideUpdate", slide);
  });  
})
console.log("Socket server initiated");

export default io;