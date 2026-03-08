import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs'; // Tambahkan fs untuk cek folder

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setGlobalPrefix('api');

    // ============================================================
    // 1. PASTIKAN FOLDER UPLOADS ADA (Mencegah Error 404)
    // ============================================================
    const uploadDir = join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Folder uploads berhasil dibuat otomatis.');
    }

    // ============================================================
    // 2. SERVE STATIC FILES (DENGAN PATH YANG LEBIH AKURAT)
    // process.cwd() memastikan kita mencari dari folder root project
    // ============================================================
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      // Tambahkan header cache agar loading lebih cepat
      setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
      },
    });

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, '0.0.0.0');

    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }

    console.log(`🚀 Backend ZieSen running:`);
    console.log(`👉 Local   : http://localhost:${port}/api`);
    console.log(`👉 Network : http://${localIp}:${port}/api`);
    console.log(`👉 Static  : http://localhost:${port}/uploads/ (Akses Foto)`);

  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

bootstrap();