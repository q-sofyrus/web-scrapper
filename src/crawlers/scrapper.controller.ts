/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {
  constructor(private readonly scrapperService: ScraperService) {}
  
  @Get('start')
  async scrape() {
    await this.scrapperService.scrapeData();
    return 'records scrapped successfullty!'
  }

  @Get('test-proxies')
  async testProxies() {
    return this.scrapperService.filterHealthyProxies();
  }
}
