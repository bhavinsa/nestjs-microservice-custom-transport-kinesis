import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KinesisReaderServer } from './kinesis.reader.server';
import dotenv = require('dotenv');
import * as path from 'path';

const envFile = path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFile });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const shardId = process.env.KINESIS_SHARDID;
  const rpcApp = app.connectMicroservice({
    strategy: new KinesisReaderServer(shardId),
  });
  await rpcApp.listenAsync();
  await app.listen(process.env.PORT);
}
bootstrap();
