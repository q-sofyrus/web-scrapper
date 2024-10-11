/* eslint-disable prettier/prettier */
import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('scrapper')
  @Render('index')  // 'index' refers to 'index.hbs'
  getHomePage() {
    return { title: 'My Web Scrapper', description: 'Its a web scrapper ' };
  }

  @Get('progress')
  @Render('progress')  // 'index' refers to 'index.hbs'
  getHomePag() {
    console.log("successfully accessed");
    return { title: 'My Web Scrapper', description: 'Its a web scrapper ' };
  }

   
}
