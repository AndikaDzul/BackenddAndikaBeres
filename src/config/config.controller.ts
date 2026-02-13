import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';
import { Config } from './config.schema';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('gps')
  async getGps() {
    return this.configService.getGpsConfig();
  }

  @Post('gps')
  async saveGps(@Body() body: Partial<Config>) {
    return this.configService.saveGpsConfig(body);
  }
}
