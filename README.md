
## Description

nestjs-microservice-custom transport-kinesis

## Installation

```bash
$ git clone https://github.com/bhavinsa/nestjs-microservice-custom-transport-kinesis.git
$ npm install
```

## Running the app

```bash
# development
$ npm run start:local

```


http://localhost:8000/createKinesisStream => To create Kinesis stream 

http://localhost:8000/sendDataToKinesis => To send data to Kinesis stream, and receive this data using EventPattern.

Note: 
- You can see kinesis stream data that sent using `sendDataToKinesis`, in log of nestjs.
- This application use kinesis docker image, it is required to remove `endpoint` from kinesis aws instance creation.
