const express = require('express');
const mongoose = require('mongoose');
const AuthRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const jobsRouter = require('./routes/jobs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const http = require('http')
const socketio = require('socket.io')

const path = require('path');
const dev = process.env.NODE_ENV !== 'production';

const PORT = process.env.PORT || 3001;
app = express();
const server = http.createServer(app)
const io = socketio(server)

//Socket.io

io.on('connection', (socket) => {
  console.log('a user connected !!!', socket);

  socket.on('message', ({message}) => {
    console.log('message', message)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


app.use(compression())
// dotenv.config();
//MongoDB Connection
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(err => {
    console.log("Error: ", err.message);
  });


//MiddleWares
app.use(express.static('upload'))
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
//Routes
app.use('/api/auth', AuthRouter);
app.use('/api/users', userRouter);
app.use('/api/jobs', jobsRouter);
//Unauthorized Handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({error: "You are not Authorized to perform this Action"})
  }
});

server.listen(PORT, () => {
  console.log(`Server Running on PORT: ${PORT}`)
});


