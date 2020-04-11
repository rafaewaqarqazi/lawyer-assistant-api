const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const AuthRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const dev = process.env.NODE_ENV !== 'production';

const app = next({dev});
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;
app.prepare()
  .then(() => {

    const server = express();
    server.use(compression())
    // dotenv.config();
    //MongoDB Connection
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('Connected to database');
      })
      .catch(err => {
        console.log("Error: ", err.message);
      });


    //Middlewares

    server.use(morgan('dev'));
    server.use(express.json());
    server.use(cookieParser());
    //Routes
    server.use('/api/auth', AuthRouter);
    server.use('/api/users', userRouter);
    //Unauthorized Handler
    server.use(function (err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).json({error: "You are not Authorized to perform this Action"})
      }
    });
    server.get('/images/:fileName', (req, res) => {
      const file = path.join(__dirname, '..', 'public','static', req.path)
      // console.log(path.join(__dirname,'..',''))
      app.serveStatic(req, res, file)
    });
    server.get('/avatar/:fileName', (req, res) => {
      const file = path.join(__dirname, '..', 'public','static', req.path)
      // console.log(path.join(__dirname,'..',''))
      app.serveStatic(req, res, file)
    });
    server.get('/', (req, res) => {
      return app.render(req, res, '/', req.query)
    });
    server.get('/sign-in', (req, res) => {
      return app.render(req, res, '/sign-in', req.query)
    });
    server.get('*', (req, res) => {
      return handle(req, res)
    });

    server.listen(PORT, () => {
      console.log(`Server Running on PORT: ${PORT}`)
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1)
  });


