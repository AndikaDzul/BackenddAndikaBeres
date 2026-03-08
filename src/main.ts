import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as os from 'os';
import * as fs from 'fs';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setGlobalPrefix('api');

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

    // ============================================================
    // LOGIKA PEMISAH LOCAL VS VERCEL (PENTING!)
    // ============================================================
    
    // Cek apakah sedang berjalan di Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    if (!isVercel) {
      // --- JALAN DI LOCAL ---
      // 1. Handle Folder Uploads (Hanya di local karena Vercel Read-Only)
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      app.useStaticAssets(uploadDir, {
        prefix: '/uploads/',
        setHeaders: (res) => { res.set('Access-Control-Allow-Origin', '*'); },
      });

      // 2. Jalankan listen hanya jika di local
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
      await app.listen(port, '0.0.0.0');

      // Log untuk local
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
      console.log(`🚀 Local: http://localhost:${port}/api`);
      console.log(`👉 Network: http://${localIp}:${port}/api`);
    } else {
      // --- JALAN DI VERCEL ---
      // Jangan panggil app.listen()! Cukup init saja.
      await app.init();
      return app;
    }

  } catch (err) {
    console.error('❌ Error starting server:', err);
    // Hanya exit jika bukan di vercel
    if (process.env.VERCEL !== '1') process.exit(1);
  }
}

// Eksekusi bootstrap
bootstrap();