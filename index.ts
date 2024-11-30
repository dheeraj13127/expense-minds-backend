import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import passport from "./src/passport/authPassport";
import http from "http";
import mongoose from "mongoose";
import { authRouter } from "./src/routes/auth";
import dotenv from "dotenv";
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Load .env variables
dotenv.config();

// Sets headers by default and improves security
app.use(helmet());
// Middleware that enables CORS for all domains
app.use(cors({ origin: "*", credentials: true }));
// Middleware to parse incoming JSON request
app.use(express.json());
// Middleware to parse incoming url encoded data
app.use(express.urlencoded({ extended: true }));
// To prevent mongo operator injections
app.use(ExpressMongoSanitize());
// Middleware that serves static files
app.use(express.static("public"));

// Initialize session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api/auth", authRouter);

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const db = process.env.DATABASE;
const environment = process.env.NODE_ENV;
const secret = process.env.JWT_SECRET;
//@ts-ignore
mongoose.connect(db).then((conn) => {
  console.log("<------- Successfully connected to DB ! ------->");
});

server.listen(port, () => {
  console.log(
    `<<---<<----- app running on port ${port} in ${environment} ----->>--->>`
  );
});
