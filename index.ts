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
import { Server, Socket } from "socket.io";
import { authenticateSocketUser } from "./src/controllers/userController";
import { createConversation, dmUser } from "./src/controllers/socketController";
import { chatRouter } from "./src/routes/chat";
import { pineconeRouter } from "./src/routes/pinecone";

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
app.use("/api/chat", chatRouter);
app.use("/api/pinecone", pineconeRouter);
app.get("/", (req: any, res: any) => {
  res.send("Expense Minds");
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;
const db = process.env.DATABASE;
const environment = process.env.NODE_ENV;
let pinecone: Pinecone;
//@ts-ignore
mongoose.connect(db).then((conn) => {
  console.log("<------- Successfully connected to DB ! ------->");
});

async function initializePinecone() {
  try {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    // await pinecone.createIndex({
    //   name: "records",
    //   dimension: 3072,
    //   metric: "cosine",
    //   spec: {
    //     serverless: {
    //       cloud: "aws",
    //       region: "us-east-1",
    //     },
    //   },
    // });
    console.log("<+++++++ Successfully connected to pinecone +++++++>");
  } catch (err) {
    console.log(err);
  }
}
initializePinecone();

const openAiModel = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large",
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.use(authenticateSocketUser).on("connection", (socket: Socket) => {
  socket.on("create-conversation", createConversation(socket, io));
  socket.on("dm-user", dmUser(socket, io));
  socket.on("disconnect", () => {
    //@ts-ignore
    io.to(socket.handshake.user?._id.toString()).emit(
      "disconnection",
      "user disconnected"
    );
  });
});
server.listen(port || 3000, () => {
  console.log(
    `<<---<<----- app running on port ${port} in ${environment} ----->>--->>`
  );
});

export { pinecone, embeddings, openAiModel };
