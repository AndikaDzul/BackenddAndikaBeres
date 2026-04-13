import { Controller, Post, Body } from '@nestjs/common';
import { AdminsService } from './admins.service';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  /**
   * Endpoint BUAWT REGISTER ADMIN BARU.
   * @param body Objek yang berisi name, email, dan password admin.
   * @returns Hasil dari proses registrasi.
   */
  @Post('register')
  register(@Body() body: { name: string; email: string; password: string }) {
    return this.adminsService.register(body);
  }

  /**
   * Endpoint untuk login admin.
   * @param body Objek yang berisi email dan password.
   * @returns Token JWT dan data profil admin jika berhasil.
   */
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminsService.login(body.email, body.password);
  }
}
