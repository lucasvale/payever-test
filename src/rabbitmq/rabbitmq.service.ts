import { Injectable } from '@nestjs/common';

import { Channel, Connection, connect } from 'amqplib';
import configuration from '../config/configuration';

@Injectable()
export class RabbitMQService {
  private readonly uri: string = `amqp://${configuration().rabbit.host}:${
    configuration().rabbit.port
  }`;

  async publish(queue: string, message: string) {
    const connection: Connection = await connect(this.uri);

    const channel: Channel = await connection.createChannel();

    await channel.assertQueue(queue);

    channel.sendToQueue(queue, Buffer.from(message));
  }
}
