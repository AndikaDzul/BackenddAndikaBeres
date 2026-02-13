import { Controller, Post, Body, Delete, Param, Get } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  getAll() {
    return this.teachersService.findAll();
  }

  @Get(':email')
  getOne(@Param('email') email: string) {
    return this.teachersService.findOne(email);
  }

  @Post()
  createTeacher(@Body() body: any) {
    return this.teachersService.create(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.teachersService.login(body.email, body.password);
  }

  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.teachersService.remove(email);
  }
}
