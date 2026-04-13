// src/config/config.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Mengambil konfigurasi GPS (lokasi 1 dan 2) dari database.
   * @returns Konfigurasi GPS yang aktif.
   */
  @Get('gps')
  async getGps() {
    return this.configService.getGpsConfig();
  }

  /**
   * Menyimpan atau memperbarui konfigurasi GPS.
   * @param body Objek yang berisi data lokasi baru (lat, lng, radius).
   * @returns Konfigurasi GPS yang telah diperbarui.
   */
  @Post('gps')
  async saveGps(@Body() body: any) {
    return this.configService.saveGpsConfig(body);
  }
}
