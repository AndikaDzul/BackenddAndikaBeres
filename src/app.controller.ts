import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Mengambil pesan selamat datang dari AppService.
   * @returns {string} Pesan "Hello World!"
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
