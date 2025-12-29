require('dotenv').config();
const {server} = require('./src/app');

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO ready for connections`);
});