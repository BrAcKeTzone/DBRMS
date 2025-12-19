import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes/index";
import errorHandler from "./middlewares/error.middleware";

const app: Express = express();

// Middleware
app.use(cors());
// Increase payload size limit to handle large file uploads and base64 encoded images
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

export default app;
