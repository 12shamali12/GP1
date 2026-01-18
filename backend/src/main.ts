import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import express, { json, urlencoded } from "express";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    credentials: false,
  });
  app.use(json({ limit: "2mb" }));
  app.use(urlencoded({ limit: "2mb", extended: true }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const uploadDir = join(process.cwd(), "uploads", "chat");
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
