import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";
import authRouter from "./modules/auth/routes/auth.routes";
import usersRouter from "./modules/users/routes/user.routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
