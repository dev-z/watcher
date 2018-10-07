const redisClient = require('./../config/redis');

module.exports = function inboundService() {
  /**
   * Checks if caching is required for the request body as per our business needs.
   * Cache only if body.text is STOP or STOP\n or STOP\r or STOP\r\n.
   * @param {Object} body The request body.
   * @param {String} body.text The SMS text to be sent.
   * @returns {boolean}
   */
  function isCachingRequired(body = {}) {
    return body.text.startsWith('STOP');
  }
  /**
   * Caches the '<from>,<to>' parameters as a unique key.
   * @param {Object} reqBody The incoming request body.
   * @param {Number} expiryTime The expiry tme in seconds.
   */
  function cacheRequest(reqBody, expiryTime = null) {
    const key = `${reqBody.from},${reqBody.to}`;
    const value = JSON.stringify(reqBody);
    if (!expiryTime) {
      redisClient.set(key, value);
    } else {
      redisClient.set(key, value, 'EX', expiryTime);
    }
  }

  return {
    isCachingRequired,
    cacheRequest,
  };
};
