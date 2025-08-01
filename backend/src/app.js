import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import {createServer} from "http"
import { Server } from "socket.io"
import rateLimit from 'express-rate-limit';
const app = express()

const allowedOrigins = [
  // Domain (no www)
  'http://placient.com',
  'https://placient.com',

  // Domain with www
  'http://www.placient.com',
  'https://www.placient.com',

  // IP-based access
  'http://52.66.197.158',
  'https://52.66.197.158',
  'http://localhost:5173',
];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(cors({
  origin: function (origin, callback) {
 
  // console.log(origin);
     if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not alCORS'));
  },
  credentials: true, // if you're using cookies/auth headers
}));

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from '../routes/user_routes.js'
import channel_router from "../routes/channel_routes.js"

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/channel", channel_router)

app.use((req, res, next) => {
  res.status(404).send("  404 server not found");
});



//export http server instead of app to use socket io
const http_server=createServer(app)
const io = new Server(http_server)
export { app,http_server,io }