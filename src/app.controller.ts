/* eslint-disable prettier/prettier */
import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}
 
  

  @Get('scrapper')
  @Render('index')  // 'index' refers to 'index.hbs'
  getHomePage() {
    return { title: 'My Web Scrapper', description: 'Its a web scrapper ' };
  }

  @Get('progress')
  @Render('registration')  // 'index' refers to 'index.hbs'
  getHomePag() {
    console.log("successfully accessed");
    return { title: 'My Web Scrapper', description: 'Its a web scrapper ' };
  }
}
