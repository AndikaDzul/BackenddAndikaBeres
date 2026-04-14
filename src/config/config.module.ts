// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './config.schema';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { StudentsModule } from '../students/students.module'; // ✅ Import StudentsModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: Config.name, 
        schema: ConfigSchema 
      }
    ]),
    StudentsModule // ✅ Tambahkan StudentsModule agar ConfigService bisa akses StudentsService
  ],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
