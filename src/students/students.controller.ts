import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  // ================= ENDPOINT LOG PULANG =================
  @Post('attendance/pulang/:nis')
  async logPulang(@Param('nis') nis: string, @Body('timestamp') body: { timestamp: string }) {
    return this.studentsService.createPulangLog(nis, body.timestamp);
  }

  // ================= ENDPOINT UPLOAD BUKTI =================
  @Post('attendance/evidence/:nis')
  @UseInterceptors(
    FileInterceptor('evidence', {
      storage: diskStorage({
        destination: './uploads/evidence',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadEvidence(@Param('nis') nis: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new HttpException('Gagal upload file', HttpStatus.BAD_REQUEST);
    return this.studentsService.saveEvidencePath(nis, file.path);
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