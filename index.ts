import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";

import http from "http";
import mongoose from "mongoose";
import { authRouter } from "./src/routes/auth";
import dotenv from "dotenv";
import { userRouter } from "./src/routes/user";
import { recordRouter } from "./src/routes/record";
import { currencyRouter } from "./src/routes/currency";
import { statisticsRouter } from "./src/routes/statistics";
import { settingsRouter } from "./src/routes/settings";
import { Pinecone } from "@pinecone-database/pinecone";
import fileUpload from "express-fileupload";
import { automatedRouter } from "./src/routes/automated";
import { OpenAI } from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";

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
app.use(express.urlencoded({ extended: false }));
// To prevent mongo operator injections
app.use(ExpressMongoSanitize());
// Middleware that serves static files
app.use(express.static("public"));

app.use(fileUpload());

// Initialize session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);

// REST api routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/record", recordRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/automated", automatedRouter);
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const db = process.env.DATABASE;
const environment = process.env.NODE_ENV;
let pinecone;
//@ts-ignore
mongoose.connect(db).then((conn) => {
  console.log("<------- Successfully connected to DB ! ------->");
});

async function initializePinecone() {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    console.log("<+++++++ Successfully connected to pinecone +++++++>");
  } catch (err) {
    console.log(err);
  }
}
initializePinecone();

const openAiModel = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  batchSize: 512,
  model: "text-embedding-3-large",
});

server.listen(port, () => {
  console.log(
    `<<---<<----- app running on port ${port} in ${environment} ----->>--->>`
  );
});

export { pinecone, embeddings, openAiModel };
