import { Controller, Get, Post, Put, Body, Param, Delete, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-students.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('students')
export class StudentsController {

  // Logger digunakan untuk debugging agar semua aktivitas endpoint terlihat di terminal
  private readonly logger = new Logger(StudentsController.name);

  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll() {

    // DEBUG:
    // Ketika endpoint GET /students dipanggil
    // akan muncul log di terminal untuk memastikan request masuk ke controller
    this.logger.log('GET /students -> mengambil semua data siswa');

    // Memanggil service untuk mengambil semua data siswa dari database
    return this.studentsService.findAll();
  }

  @Get(':nis')
  findOne(@Param('nis') nis: string) {

    // DEBUG:
    // Menampilkan NIS yang diminta dari frontend
    this.logger.log(`GET /students/${nis} -> mengambil data siswa`);

    // Mengambil satu data siswa berdasarkan NIS
    return this.studentsService.findOne(nis);
  }

  @Post('login')
  async login(@Body() body: { nis: string; password: string }) {

    // Mengambil data dari request body
    const { nis, password } = body;

    // DEBUG:
    // Menandakan ada request login dari siswa
    this.logger.log(`POST /students/login -> login siswa ${nis}`);

    // Memanggil service untuk melakukan proses login
    const student = await this.studentsService.login(nis, password);

    // DEBUG:
    // Jika login gagal akan muncul warning di terminal
    if (!student) {
      this.logger.warn(`Login gagal untuk NIS ${nis}`);
      return { success: false, message: 'NIS atau password salah' };
    }

    // DEBUG:
    // Jika login berhasil
    this.logger.log(`Login berhasil untuk NIS ${nis}`);

    // Mengembalikan data siswa ke frontend
    return { success: true, student };
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {

    // DEBUG:
    // Mengecek siswa baru yang dibuat
    this.logger.log(`POST /students -> membuat siswa baru ${dto?.nis}`);

    // Memanggil service untuk menyimpan siswa ke database
    return this.studentsService.create(dto);
  }

  @Post('attendance/:nis')
  createAttendance(
    @Param('nis') nis: string,
    @Body() body: CreateAttendanceDto,
  ) {

    // DEBUG:
    // Menampilkan NIS siswa yang melakukan absensi masuk
    this.logger.log(`POST /students/attendance/${nis} -> absensi masuk`);

    // Memanggil service untuk menyimpan absensi masuk
    return this.studentsService.createAttendance(nis, body);
  }

  @Post('attendance/pulang/:nis')
  async logPulang(
    @Param('nis') nis: string,
    @Body() body: { timestamp: string },
  ) {

    // DEBUG:
    // Mengecek siswa yang melakukan absensi pulang
    this.logger.log(`POST /students/attendance/pulang/${nis} -> absensi pulang`);

    // Memanggil service untuk mencatat log pulang
    return this.studentsService.createPulangLog(nis, body?.timestamp);
  }

  @Post('absensi-manual')
  async updateManual(
    @Body() body: { nis: string; status: string; teacherName: string },
  ) {

    // DEBUG:
    // Menampilkan siapa guru yang melakukan update manual
    this.logger.log(
      `POST /students/absensi-manual -> update manual ${body.nis} oleh ${body.teacherName}`,
    );

    // Memanggil service untuk memperbarui status absensi manual
    return this.studentsService.updateManual(
      body.nis,
      body.status,
      body.teacherName,
    );
  }

  @Post('reset')
  async resetAll() {

    // DEBUG:
    // Menandakan semua data absensi akan direset
    this.logger.warn('POST /students/reset -> reset semua absensi');

    // Memanggil service untuk mereset seluruh absensi
    return this.studentsService.resetAllAttendance();
  }

  @Post('voucher/:nis')
  async claimVoucher(
    @Param('nis') nis: string,
    @Body() body: { voucherCode: string },
  ) {
    this.logger.log(`POST /students/voucher/${nis} -> claim voucher`);
    return this.studentsService.claimVoucher(nis, body.voucherCode);
  }

  @Put('points/:nis')
  async updatePoints(
    @Param('nis') nis: string,
    @Body() body: { points: number },
  ) {
    this.logger.log(`PUT /students/points/${nis} -> update points manually`);
    return this.studentsService.updatePoints(nis, body.points);
  }

  @Post('bulk-update-points')
  async bulkUpdatePoints(@Body() body: { data: { nis: string; points: number; vouchers: number; vouchersMapel?: number; vouchersAlfa?: number }[] }) {
    this.logger.log(`POST /students/bulk-update-points -> bulk update points and vouchers`);
    return this.studentsService.bulkUpdatePoints(body.data);
  }

  @Post(':nis/buy-voucher')
  async buyVoucher(
    @Param('nis') nis: string,
    @Body() body: { cost: number; itemType?: string },
  ) {
    this.logger.log(`POST /students/${nis}/buy-voucher -> student buys voucher of type ${body.itemType || 'generic'}`);
    return this.studentsService.buyVoucher(nis, body.cost, body.itemType);
  }

  @Post(':nis/absence-penalty')
  async absencePenalty(
    @Param('nis') nis: string,
    @Body() body: { type: string; description?: string },
  ) {
    this.logger.log(`POST /students/${nis}/absence-penalty -> applying ${body.type} penalty`);
    return this.studentsService.absencePenalty(nis, body.type, body.description);
  }

  @Post(':nis/upload-profile')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Hanya file gambar yang diizinkan!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // Limit to 2MB for DB storage
  }))
  async uploadProfile(@Param('nis') nis: string, @UploadedFile() file: any) {
    this.logger.log(`POST /students/${nis}/upload-profile -> uploading image to database`);
    const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.studentsService.updateProfileImage(nis, base64Data);
  }

  @Delete(':nis/point-history')
  async clearPointHistory(@Param('nis') nis: string) {
    this.logger.warn(`DELETE /students/${nis}/point-history -> clearing points history`);
    return this.studentsService.clearPointHistory(nis);
  }

  @Delete(':nis')

  remove(@Param('nis') nis: string) {

    // DEBUG:
    // Menampilkan siswa yang dihapus dari database
    this.logger.warn(`DELETE /students/${nis} -> menghapus siswa`);

    // Memanggil service untuk menghapus siswa
    return this.studentsService.remove(nis);
  }
}