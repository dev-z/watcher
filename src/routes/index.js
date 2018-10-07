/**
 * Contains all the routes to be available for this micro-service API.
 * POST     /inbound/sms
 * POST     /outbound/sms
 */
const { validateParams } = require('./../utils/validations');
const DBPhoneNumberServices = require('./../services/db.phonenumber')();
const inboundServices = require('./../services/inbound.service')();
const outboundServices = require('./../services/outbound.service')();
const errorHandler = require('./../utils/errorhandling')();

module.exports = function registerRoutes(router) {
  // --------------------------------------------------------------------------------------------
  // on routes that end in /inbound/sms
  // --------------------------------------------------------------------------------------------
  /**
   * @param {String} from
   * @param {String} to
   * @param {String} text
   */
  router.route('/inbound/sms')
    .post((req, res) => {
      // Validate the inputs
      const errors = validateParams(req.body);
      if (!errors) {
        // If the ‘to’ parameter is not present in the phone_number table for this specific account
        // used for the basic authentication, return an error.
        DBPhoneNumberServices.findIfRecordExists(req.body.to, req.requesterData.id)
          .then((isFound) => {
            if (isFound) {
              // Check if caching is required or not.
              if (inboundServices.isCachingRequired(req.body)) {
                // If required, just cache the request uniquely.
                // Async. Dont wait for the results.
                // Expiry time: 4 hrs in seconds.
                inboundServices.cacheRequest(req.body, 14400);
              }
              res.status(200).json({
                message: 'inbound sms ok',
                error: '',
              });
            } else {
              res.status(400).json({
                message: '',
                error: 'to parameter not found',
              });
            }
          });
      } else {
        const data = {
          message: '',
          error: errorHandler.getErrorString(errors),
        };
        res.status(400).json(data);
      }
    });

  // --------------------------------------------------------------------------------------------
  // on routes that end in /outbound/sms
  // --------------------------------------------------------------------------------------------
  /**
   * @param {String} from
   * @param {String} to
   * @param {string} text
   */
  router.route('/outbound/sms')
    .post((req, res) => {
      // Validate the inputs
      const errors = validateParams(req.body);
      if (!errors) {
        // If the pair ‘to’, ‘from’ matches any entry in cache (STOP), return an error
        outboundServices.isCachedToStop(req.body).then((isStopped) => {
          if (isStopped) {
            res.status(400).json({
              message: '',
              error: `sms from ${req.body.from} to ${req.body.to} blocked by STOP request`,
            });
          } else {
            // Check for rate limit
            outboundServices.checkLimit(String(req.body.from)).then((limit) => {
              if (limit.remaining > 0) {
                // If the ‘from’ parameter is not present in the phone_number table for this
                // specific account you used for the basic authentication, return an error.
                DBPhoneNumberServices.findIfRecordExists(req.body.from, req.requesterData.id)
                  .then((isFound) => {
                    if (isFound) {
                      // If found, increment value by one in the api hit counter
                      outboundServices.incrementCount(req.body);
                      res.status(200).json({
                        message: 'outbound sms ok',
                        error: '',
                        limit,
                      });
                    } else {
                      res.status(400).json({
                        message: '',
                        error: 'from parameter not found',
                      });
                    }
                  });
              } else {
                res.status(400).json({
                  message: '',
                  error: `limit reached for from ${req.body.from}`,
                });
              }
            });
          }
        }, (rejectError) => {
          res.status(400).json(rejectError);
        });
      } else {
        const data = {
          message: '',
          error: errorHandler.getErrorString(errors),
        };
        res.status(400).json(data);
      }
    });
};
