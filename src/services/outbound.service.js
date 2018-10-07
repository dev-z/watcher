const redisClient = require('./../config/redis');

const DAILY_SMS_QUOTA = 50;

module.exports = function getOutboundServices() {
  /**
   * Finds '<to>,<from>' key in the cache.
   * @param {String} to The to number
   * @param {String} from The from number
   * @returns {Promise}
   */
  function findInCache(to, from) {
    const key = `${to},${from}`;
    return redisClient.getAsync(key);
  }

  /**
   * Checks the cache to see if there is a STOP request for the to,from pair.
   * @param {Object} reqBody The incoming request body.
   * @returns {Promise<boolean>}
   */
  function isCachedToStop(reqBody) {
    return new Promise((resolve, reject) => {
      findInCache(reqBody.to, reqBody.from).then((res) => {
        if (res) {
          const val = JSON.parse(res);
          if (val.text.startsWith('STOP')) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }).catch((err) => {
        console.error(err);
        reject({
          message: '',
          error: 'unknown failure',
        });
      });
    });
  }

  /**
   * Increments the counter by one for each number (from) for each outbound SMS.
   * @param {Object} reqBody The request body
   */
  function incrementCount(reqBody) {
    const key = reqBody.from;
    // Check if already present
    redisClient.getAsync(key).then((res) => {
      const val = Number(res);
      if ((!res) || Number.isNaN(val)) {
        // If not present, set the value as 1 and expiry time 24 hours.
        const expiresInSeconds = 24 * 3600;
        redisClient.set(key, '1', 'EX', expiresInSeconds);
      } else {
        // otherwise just increment the value
        const newVal = String(val + 1);
        redisClient.set(key, newVal);
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  /**
   * Checks if the daily sms quota has been reached for the given number or not.
   * @param {String} fromNumber The number from which the SMS is going.
   * @returns {Promise}
   */
  function checkLimit(fromNumber) {
    return new Promise((resolve, reject) => {
      redisClient.getAsync(fromNumber).then((res) => {
        const val = Number(res);
        if ((!res) || Number.isNaN(val)) {
          // If not present, it means that there is no counter for this number,
          // or it has already expired after 24 hours.
          resolve({
            used: 0,
            remaining: DAILY_SMS_QUOTA,
          });
        } else {
          resolve({
            used: val,
            remaining: (DAILY_SMS_QUOTA - val),
          });
        }
      }).catch((err) => {
        console.error(err);
        reject({
          message: '',
          error: 'unknown failure',
        });
      });
    });
  }

  return {
    findInCache,
    isCachedToStop,
    incrementCount,
    checkLimit,
  };
};
