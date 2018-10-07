const Account = require('./../models/Account');

const allowedPaths = [
  '/inbound/sms',
  '/outbound/sms',
];

module.exports = function registerBasicAuthMiddleware(router) {
  // Middleware to use for all requests.
  router.use((req, res, next) => {
    // Check if path is allowed or not
    if (allowedPaths.includes(req.path) && req.method === 'POST') {
      // This path is allowed.
      // check header or url parameters or post parameters for token
      let username = req.body.username || req.query.username || req.headers.username;
      let password = req.body.password || req.query.password || req.headers.password;
      const { authorization } = req.headers;
      if (authorization) {
        // This means user has used base64 encoded Basic Auth scheme
        const [type, encodedString] = authorization.split(' ');
        if (type === 'Basic') {
          const decryptStr = Buffer.from(encodedString, 'base64').toString('utf8');
          [username, password] = decryptStr.split(':');
        }
      }
      // 1.a. Proceed only if username and password are present.
      if (username && password) {
        // 2.a. Verify that the username and password(alias for auth_id) exists in db.
        Account.findOne({
          where: {
            username,
            auth_id: password,
          },
        }).then((account) => {
          // if record with given search criteria is found, save to request for future use.
          if (account) {
            req.requesterData = account;
            // do logging or whatever is needed
            next();
          } else {
          // No record is found, return 403: Forbidden.
            res.status(403).send({
              message: 'Invalid credentials',
              error: 'INVALID_CREDENTIALS',
            });
          }
        }).catch(() => {
          res.status(400).send({
            message: '',
            error: 'unknown failure',
          });
        });
      } else {
        // 1.b. Otherwise, send a 403: Forbidden error.
        res.status(403).send({
          message: 'No authentication provided. Please refer to docs to how to send your authentication data.',
          error: 'NO_AUTH_FOUND',
        });
      }
    } else if (allowedPaths.includes(req.path)) {
      // This path is not allowed, return 405: Method not allowed
      res.status(405).send({
        message: '',
        error: 'Method not allowed',
      });
    }
  });
};
