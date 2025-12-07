import "dotenv/config";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { getOrigin, getServerPort } from "src/config";
import { AppModule } from "src/modules/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  try {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    app.enableCors({
      origin: getOrigin(),
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle("Disculla API")
      .setDescription("Disculla API documentation")
      .setVersion("1.0")
      .addTag("Disculla")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, document);

    await app.listen(getServerPort());
  } catch (error) {
    console.error("サーバーの起動に失敗しました:", error);
    process.exit(1);
  }
}
void bootstrap();
