import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

// Modules
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TeachersModule } from './teachers/teachers.module';
import { AdminsModule } from './admins/admins.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    // ENV global
    NestConfigModule.forRoot({ isGlobal: true }),

    // Koneksi MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/absensi',
      { autoCreate: true },
    ),

    // App Modules
    StudentsModule,
    AttendanceModule,
    TeachersModule,
    AdminsModule,
    SchedulesModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}