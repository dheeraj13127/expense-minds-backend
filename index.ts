import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import http from "http";
import mongoose from "mongoose";
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Sets headers by default and improves security
app.use(helmet());
// Middleware that enables CORS for all domains
app.use(cors({ origin: "*" }));
// Middleware to parse incoming JSON request
app.use(express.json());
// Middleware to parse incoming url encoded data
app.use(express.urlencoded({ extended: true }));
// To prevent mongo operator injections
app.use(ExpressMongoSanitize());
// Middleware that serves static files
app.use(express.static("public"));

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const db = process.env.DATABASE;
server.listen(port, () => {
  console.log(`<<---<<-----app running on port ${port} ----->>--->>`);
});
