import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-students.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':nis')
  findOne(@Param('nis') nis: string) {
    return this.studentsService.findOne(nis);
  }

  @Post('login')
  async login(@Body() body: { nis: string; password: string }) {
    const { nis, password } = body;
    const student = await this.studentsService.login(nis, password);
    if (!student) return { success: false, message: 'NIS atau password salah' };
    return { success: true, student };
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Post('attendance/:nis')
  createAttendance(
    @Param('nis') nis: string,
    @Body() body: CreateAttendanceDto,
  ) {
    return this.studentsService.createAttendance(nis, body);
  }

  @Post('attendance/pulang/:nis')
  async logPulang(
    @Param('nis') nis: string,
    @Body('timestamp') timestamp: string,
  ) {
    return this.studentsService.createPulangLog(nis, timestamp);
  }

  @Post('absensi-manual')
  async updateManual(
    @Body() body: { nis: string; status: string; teacherName: string },
  ) {
    return this.studentsService.updateManual(body.nis, body.status, body.teacherName);
  }

  @Post('reset')
  async resetAll() {
    return this.studentsService.resetAllAttendance();
  }

  @Delete(':nis')
  remove(@Param('nis') nis: string) {
    return this.studentsService.remove(nis);
  }
}