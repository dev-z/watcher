/* ----------------------------------------------- *
 *                API Server                       *
 * ----------------------------------------------- */
// Importing the core modules ------------------- //
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// BASE CONFIGURATIONS -------------------------- //
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Load libraries to be used ------------------- //
const sequelize = require('./src/config/dbcon');
const registerBasicAuthMiddleware = require('./src/utils/authmiddleware');

// Require route initiator functions ----------- //
const registerRoutes = require('./src/routes');

const router = express.Router();

// HELPER FUNCTIONS ---------------------------- //
function loadRoutes() {
  // --- UNPROTECTED ROUTES --- //
  // Health check route to make sure everything is working.
  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'API server is up and running!',
    });
  });
  // Authenticating the incoming requests for all routes listed below this function.
  registerBasicAuthMiddleware(router);
  // --- PROTECTED ROUTES --- //
  // Place more routes here
  registerRoutes(router);
  // base route is /api/version
  app.use('/api/v1', router);
}

function startServer() {
  loadRoutes();
  const port = process.env.PORT || 8001;
  // Start listening for incoming requests.
  app.listen(port, () => {
    console.info(`API Server up and running on port ${port} in ${process.env.STAGE} mode.`);
  });
}

// START THE SERVER ----------------------------- //
// 1. Try connecting to DB
sequelize
  .authenticate()
  .then(() => {
    // If connection is successful, start the server.
    console.info('Connection has been established successfully.');
    startServer();
  })
  .catch((err) => {
    // Otherwise, log the error and exit.
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

// Export the express app as a handler property of module.exports
module.exports = app;
