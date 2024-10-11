/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapperModule } from './crawlers/scrapper.module';

@Module({
  imports: [ScrapperModule],
  controllers: [AppController], // Keep only the AppController here
  providers: [AppService], // Keep only the AppService here
})
export class AppModule {}
