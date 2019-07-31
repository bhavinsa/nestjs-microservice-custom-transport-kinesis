import {
  Server,
  CustomTransportStrategy,
  EventPattern,
} from '@nestjs/microservices';
import AWS = require('aws-sdk');
import kinesisReadable = require('kinesis-readable');

export class KinesisReaderServer extends Server implements CustomTransportStrategy {
  private server: any = null;
  constructor(private readonly shardId: string) {
    super();
  }

  public async listen(callback: () => void) {
    await this.init();
    this.server
      .on('data', records => {
        for (const record of records) {
          const rawdata: any = Buffer.from(record.Data, `base64`);
          const data = JSON.parse(rawdata);
          this.logger.debug(`PartitionKey - ${record.PartitionKey}`);
          if (data) {
            this.handleMessage(data);
          }
        }
        callback();
      })
      .on('checkpoint', sequenceNumber => {
        this.logger.debug(`checkpoint - ${sequenceNumber}`);
      });

    callback();
  }

  private async init() {
    const client = new AWS.Kinesis({
      endpoint: 'http://localhost:4567',  // This is for docker kinesis, remove it once you have AWS kinesis
      region: process.env.KINESIS_REGION,
      params: { StreamName: process.env.KINESIS_STREAMNAME },
    });
    const shard = this.shardId;
    const options = {
      shardId: shard,
      timestamp: new Date(),
      iterator: process.env.KINESIS_ITERATOR,
    };
    this.server = kinesisReadable(client, options);
  }

  public close() {
    if (this.server) {
      this.server.close();
    }
  }

  private async handleMessage(data) {
    this.logger.debug(data);
    const packet: any = {
      pattern: data.actionType,
      data: data.payload,
    };
    this.logger.debug(`Pattern is ${data.actionType}`);
    this.logger.debug(`packet.data  is ${JSON.stringify(packet.data)}`);
    this.handleEvent(packet.pattern, packet);
  }
}
