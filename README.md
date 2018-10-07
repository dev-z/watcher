# Watcher

A simple microservice to help you monitor your SMS services. (POC)

## Dependencies ##

* NodeJS v6.10+, npm.
* Postgresql 10.4+.
* Redis 4.0.11+.

* OpenAPI 3.0 documentation

## How do I get set up? ##

* Clone the repo to your local machine.
* Make sure you have your dependencies installed/ready.
* cd to the project folder you just cloned.
* Create .env file with the required values. (See Creating .env file)
* Open terminal run 'npm install'.
* run tests with command "npm test"
* run the server with command "npm start"

```bash
# clone repository
git clone https://github.com/dev-z/watcher.git

# cd to project directory
cd watcher

# create .env file

# install dependencies
npm install

# run server at localhost:8001 
# or whichever port is specified in .env file
npm start
```

## Creating .env file ##

This project uses "dotenv" npm package to store and use enviroment variables.
Create a .env file in the root folder. Inside this file, the following variables must be declared:

* STAGE      : 'production', 'development', or 'staging'.
* PORT       : port on which to run the API server.
* DB_NAME    : Name of the database you want to connect to.
* DB_USERNAME: username with which to connect to the DB.
* DB_USERPASS: password of the above given user.
* DB_HOST    : hostname of the server where the DB is located. [DEFAULT 127.0.01].
* DB_PORT    : port of the DB service. [DEFAULT 5432].
* REDIS_HOST : Host on which the redis server is running. [DEFAULT 127.0.01].
* ReDIS_PORT : Port on which the redis server is running. [DEFAULT 6379].

```
# Sample .env file
STAGE=development
PORT=8001
DB_NAME=smsdb
DB_USERNAME=myuser
DB_USERPASS=mysecretpassword
DB_HOST=127.0.0.1
DB_PORT=5432;
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

## Linting ##

Uses ESLint and Airbnb JS style-guide to help write standard and clean code

To use linting, please ensure that you have dev-dependencies installed for this project.

* VS Code - Install the ESLint plugin by Dirk Baeumer.
* Manually - run the follwing command:

```
node node_modules/eslint/bin/eslint --ext .js index.js src
```

## Running tests ##

Uses Mocha and ChaiJS to run automated tests. You can use the results to integrate with CI/CD tools.
Run the following command to run the tests.

```
npm run test
```

## Contribution guidelines ##
* TODO

## Writing tests ##
* TODO

## Help me out ##
This is just a Proof Of Concept built in a day and hence it might not be "perfect".

* If you want to enhance something, please fork this repo, make changes on your copy and submit a pull-request.
* If you want something added, please raise an issue.
* If you see a bug, please raise an issue OR fix it and submit a pull request.

Positive feedback and suggestions are appreciated.

## Who do I talk to? ##

* ishtiaque.zafar92 [at] gmail [dot] com

