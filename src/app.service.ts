import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Mengembalikan string sapaan standar.
   * @returns {string} Pesan "Hello World!"
   */
  getHello(): string {
    return 'Hello World!';
  }
}
