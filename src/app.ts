import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());

  app.use(express.json());
  app.use(cookieParser());

  return app;
}
