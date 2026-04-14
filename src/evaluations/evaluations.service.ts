import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation } from './schemas/evaluation.schema';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectModel(Evaluation.name) private readonly evaluationModel: Model<Evaluation>,
  ) {}

  async create(data: any): Promise<Evaluation> {
    const createdEvaluation = new this.evaluationModel(data);
    return createdEvaluation.save();
  }

  async findByStudent(studentNis: string): Promise<Evaluation[]> {
    return this.evaluationModel.find({ studentNis }).sort({ createdAt: -1 }).exec();
  }

  async getLatestEvaluationsMap(studentNisList: string[]): Promise<Record<string, Evaluation>> {
    const latestEvals = await this.evaluationModel.aggregate([
      { $match: { studentNis: { $in: studentNisList } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$studentNis',
          evaluation: { $first: '$$ROOT' },
        },
      },
    ]);

    const resultMap: Record<string, Evaluation> = {};
    for (const item of latestEvals) {
      resultMap[item._id] = item.evaluation;
    }
    return resultMap;
  }

  // METHOD UPDATE UNTUK EDIT PENILAIAN
  async update(id: string, data: any): Promise<Evaluation> {
    const updated = await this.evaluationModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    
    if (!updated) {
      throw new NotFoundException(`Penilaian dengan ID ${id} tidak ditemukan`);
    }
    return updated;
  }

  // METHOD DELETE UNTUK HAPUS PENILAIAN
  async remove(id: string): Promise<any> {
    const result = await this.evaluationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Gagal menghapus, ID ${id} tidak ditemukan`);
    }
    return result;
  }
}