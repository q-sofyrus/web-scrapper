/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { CrawlersService } from './crawlers.service';

@Controller('crawler')
export class CrawlersController {
  constructor(private readonly crawlersService: CrawlersService) {}

  @Get('scrape')
  async scrape() {
    return await this.crawlersService.scrapeData();
  }

  @Get('test-proxies')
  async testProxies() {
    return this.crawlersService.checkProxies();
  }
}
