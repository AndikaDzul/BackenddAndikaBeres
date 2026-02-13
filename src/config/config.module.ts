import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from './config.schema';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }])
  ],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService], // agar bisa dipakai di module lain
})
export class ConfigModule {}
