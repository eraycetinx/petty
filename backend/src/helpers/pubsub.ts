import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const options = {
  host: "redis-11081.c12.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 11081,
  password: "gdaQCA0JaACvmJSrCUHlVaikkdTLYGXl",
  retryStrategy: (times: number) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

export default pubsub;
