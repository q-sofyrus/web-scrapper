/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ScrapperController } from './scrapper.controller';
import {ScraperService } from './scrapper.service';
import {MyService} from './my.service'
import { CopyrightService } from './copyright.service';
@Module({
  controllers: [ScrapperController],
  providers: [ScraperService,MyService, CopyrightService ],
})
export class ScrapperModule {}
