import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { TypeOrmConfigService } from '../../config/typeorm.config';
import { seedInitialData } from './initial-data.seed';

async function runSeed() {
  // Load environment variables
  config();

  const configService = new ConfigService();
  const typeOrmConfig = new TypeOrmConfigService(configService);
  const dataSource = new DataSource(typeOrmConfig.createTypeOrmOptions() as any);

  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    await seedInitialData(dataSource);
    console.log('✅ Seeding completed');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
