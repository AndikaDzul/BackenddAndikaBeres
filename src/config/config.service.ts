import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Config, ConfigDocument } from './config.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<ConfigDocument>
  ) {}

  async getGpsConfig(): Promise<Config> {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      config = await this.configModel.create({ lat: 0, lng: 0, radius: 50 });
    }
    return config;
  }

  async saveGpsConfig(data: Partial<Config>): Promise<Config> {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      config = await this.configModel.create(data);
    } else {
      config.lat = data.lat ?? config.lat;
      config.lng = data.lng ?? config.lng;
      config.radius = data.radius ?? config.radius;
      await config.save();
    }
    return config;
  }
}
