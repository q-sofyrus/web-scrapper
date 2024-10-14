/* eslint-disable prettier/prettier */
import { Controller, Get, Query} from '@nestjs/common';
import { ScraperService } from './scrapper.service';
import { MyService } from './my.service';
@Controller('scrapper')
export class ScrapperController {
  constructor(private readonly scrapperService: ScraperService,private readonly myservice:MyService) {}
  
  @Get('start')
  async scrape() {
    await this.scrapperService.scrapeData();
    return 'records scrapped'
  }


  @Get('test-proxies')
  async testProxies() {
    return this.scrapperService.filterHealthyProxies();
  }

  
  @Get('fetch-registration')
  //@Render('registration')
async fetch( @Query('category') category: string, @Query('alpha') alpha: string, @Query('urlStart') urlStart: number, @Query('urlEnd') urlEnd: number) {
     console.log(`Alpha: ${alpha}, Category: ${category}`, urlStart, "-",urlEnd);
    
    // You can pass these parameters to a service method if needed
    return this.myservice.fetch_registration(category, alpha, urlStart,urlEnd);

 }

}
