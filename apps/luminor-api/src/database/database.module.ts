import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection, STATES } from 'mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (connection.readyState === STATES.connected) {
      console.log(
        `MongoDB is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db`,
      );
    } else {
      console.log('Failed to connect to MongoDB');
    }
  }
}
