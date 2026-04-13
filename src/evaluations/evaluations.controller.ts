import { Controller, Post, Body, Get, Param, HttpStatus, Res, Put, Delete } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  async create(@Body() createDto: any, @Res() res) {
    try {
      const data = await this.evaluationsService.create(createDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Penilaian karakter berhasil disimpan',
        data,
      });
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Gagal menyimpan penilaian',
        error: err.message,
      });
    }
  }

  @Get('student/:nis')
  async getHistory(@Param('nis') nis: string) {
    return this.evaluationsService.findByStudent(nis);
  }

  // ENDPOINT UPDATE (PUT)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any, @Res() res) {
    try {
      const data = await this.evaluationsService.update(id, updateDto);
      return res.status(HttpStatus.OK).json({
        message: 'Penilaian berhasil diperbarui',
        data,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Gagal memperbarui penilaian',
        error: err.message,
      });
    }
  }

  // ENDPOINT DELETE
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    try {
      await this.evaluationsService.remove(id);
      return res.status(HttpStatus.OK).json({
        message: 'Penilaian berhasil dihapus',
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Gagal menghapus penilaian',
        error: err.message,
      });
    }
  }
}