/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ScrapperController } from './scrapper.controller';
import {ScraperService } from './scrapper.service';

@Module({
  controllers: [ScrapperController],
  providers: [ScraperService],
})
export class ScrapperModule {}
