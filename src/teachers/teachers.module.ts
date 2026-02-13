import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Teacher, TeacherSchema } from './teacher.schema';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }])],
  providers: [TeachersService],
  controllers: [TeachersController],
  exports: [TeachersService],
})
export class TeachersModule {}
