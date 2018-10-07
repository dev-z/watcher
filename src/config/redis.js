const redis = require('redis');
const { promisify } = require('util');

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = process.env.REDIS_PORT || 6379;
const redisClient = redis.createClient({ host, port });

redisClient.on('connect', () => {
  console.info('Redis client connected. Testing set and get...');
  redisClient.set('healthcheck', 'my test value', redis.print);
  redisClient.get('healthcheck', redis.print);
  // Promisified get
  redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
});

redisClient.on('error', (err) => {
  console.error(`Error connecting to redis cache ${err}`);
  redisClient.quit();
});

module.exports = redisClient;
