import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>) {}

  async create(data: CreateScheduleDto) {
    return new this.scheduleModel(data).save();
  }

  async findAll() {
    return this.scheduleModel.find().lean();
  }

  async findByDay(day: string) {
    return this.scheduleModel.find({ hari: day }).lean();
  }

  async getScheduleForClass(kelas: string, day: string) {
    return this.scheduleModel.find({ kelas, hari: day }).lean();
  }
}
