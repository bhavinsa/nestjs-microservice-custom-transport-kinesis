import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';
import AWS = require('aws-sdk');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger('EventController');

  @Get('createKinesisStream')
  createKinesisStream(): any {
    const kinesis = new AWS.Kinesis({
      endpoint: 'http://localhost:4567',  // This is for docker kinesis, remove it once you have AWS kinesis
      region: process.env.KINESIS_REGION,
    });

    return new Promise((resolve, reject) => {
      try {
        kinesis.createStream({StreamName:process.env.KINESIS_STREAMNAME, ShardCount:1 }, (error, data) => {
          if (error) {
            this.logger.log(`Error in createStream - ${JSON.stringify(error)}`);
            reject(error);
          } else {
            this.logger.log(
              `Successfully created Stream - ${JSON.stringify(data)}`
            );
            resolve(data);
          }
        });
      } catch (error) {
        this.logger.log(`Error in send - ${JSON.stringify(error)}`);
      }
    });
  }

  @Get('sendDataToKinesis')
  sendDataToKinesis(): any {
    const kinesis = new AWS.Kinesis({
      endpoint: 'http://localhost:4567',  // This is for docker kinesis, remove it once you have AWS kinesis
      region: process.env.KINESIS_REGION,
    });
    const partitionKey = `partitionKey-' ${Math.floor(Math.random() * 100000)}`;
    const payload: any  = [
      {
      _id: '5d401b6a32eb4b45b23d33d4',
      isActive: false,
      balance: '$3,654.62',
      picture: 'http://placehold.it/32x32',
      age: 21,
      eyeColor: 'blue',
      name: 'Santiago Vinson',
      gender: 'male',
      company: 'IMANT',
      email: 'santiagovinson@imant.com',
      phone: '+1 (986) 568-2751',
      address: '885 Miami Court, Riverton, South Dakota, 2094'
      },
    ];
    const kinesisData = {
      Data: JSON.stringify({
        actionType: 'ADD:USER',
        payload,
      }),
      PartitionKey: partitionKey,
      StreamName: process.env.KINESIS_STREAMNAME,
    };

    return new Promise((resolve, reject) => {
      try {
        kinesis.putRecord(kinesisData, (error, data) => {
          if (error) {
            this.logger.log(`Error in putRecord - ${JSON.stringify(error)}`);
            reject(error);
          } else {
            this.logger.log(
              `Successfully sent data to Kinesis - ${JSON.stringify(data)}`
            );
            resolve(data);
          }
        });
      } catch (error) {
        this.logger.log(`Error in send - ${JSON.stringify(error)}`);
      }
    });
  }

  @EventPattern('ADD:USER')
  async handleAddUser(data: Record<string, unknown>) {
    this.logger.debug(`handleAddUser`);
    this.logger.debug(JSON.stringify(data));
  }
}
