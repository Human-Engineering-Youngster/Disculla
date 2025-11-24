import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { getOrigin, getServerPort } from "src/config";
import { AppModule } from "src/modules/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  try {
    app.enableCors({
      origin: getOrigin(),
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle("Iterate API")
      .setDescription("Iterate API documentation")
      .setVersion("1.0")
      .addTag("iterate")
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
