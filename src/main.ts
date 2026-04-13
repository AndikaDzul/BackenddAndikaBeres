import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Fungsi utama untuk menginisialisasi dan menjalankan aplikasi NestJS.
 * Mengatur konfigurasi global seperti prefix, CORS, validasi pipe,
 * dan manajemen aset statis atau inisialisasi untuk Vercel.
 * @returns {Promise<INestApplication>} Instance aplikasi yang telah dibuat.
 */
export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefix API (Penting: URL menjadi http://localhost:3000/api/evaluations)
  app.setGlobalPrefix('api');

  // PERBAIKAN: Tambahkan 'PUT' ke dalam methods agar Update bekerja
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validasi Global agar DTO bekerja
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (!isVercel) {
    // LOGIKA LOCAL
    const uploadDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    app.useStaticAssets(uploadDir, {
      prefix: '/uploads/',
      setHeaders: (res) => { res.set('Access-Control-Allow-Origin', '*'); },
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Local Server: http://localhost:${port}/api`);
  } else {
    // LOGIKA VERCEL
    await app.init();
  }
  
  return app;
}

// Jalankan otomatis hanya jika di local
if (process.env.VERCEL !== '1') {
  bootstrap();
}