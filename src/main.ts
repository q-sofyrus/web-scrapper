/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
 
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set the view engine (e.g., Handlebars)
  app.setViewEngine('hbs');
 // Optional: Disable cache for development
 app.set('view cache', false);
  // Specify the folder for static assets (like CSS, images)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Specify the folder where your templates are located
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  await app.listen(3000);
}

bootstrap();
