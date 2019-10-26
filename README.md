# stack-overflow-lite-api

> API that implements the basic features of stack overflow

- authentication via [JWT](https://jwt.io/)
- Routes mapping via [express-router](https://expressjs.com/en/guide/routing.html)
- Documented using [Swagger](https://swagger.io). Find link to docs [here](http://206.189.227.235:3000/api-docs)
- Background operations are run on [stack-overflow-lite-background-service](https://github.com/mogbeyi-david/softcom-interview-background-service.git). This is private repo and will return 404 if you do not have access
- Uses [MongoDB](https://www.mongodb.com) as database.
- [Mongoose](https://mongoosejs.com) as object document model
- Environments for `development`, `testing`, and `production`
- Linting via [eslint](https://github.com/eslint/eslint)
- Integration tests running with [Jest](https://github.com/facebook/jest)
- Built with [npm scripts](#npm-scripts)
- Asynchronous and background operations via [RabbitMQ](https://www.rabbitmq.com/uri-spec.html)
- Uses [Elastic Search](https://www.elastic.co/products/elasticsearch) for search operations
- [Jenkins](https://jenkins.io) for continuous integration and continuous deployment
- [Digital Ocean](https://digitalocean.com) for deployment
- Containerization with [Docker](https://www.docker.com)
- Pull request style enforcement using [HoundCI](https://houndci.com)
- example for User model and User controller, with jwt authentication, simply type `npm i` and `npm start`

## Table of Contents

- [Install & Use](#install-and-use)
- [Folder Structure](#folder-structure)
- [Repositories](#repositories)
  - [Create a Repository](#create-a-repository)
- [Controllers](#controllers)
  - [Create a Controller](#create-a-controller)
- [Models](#models)
  - [Create a Model](#create-a-model)
- [Middlewares](#middlewares)
  - [auth.middleware](#authmiddleware)
  - [admin.middleware](#adminmiddleware)
- [Services](#services)
- [Config](#config)
  - [Connection and Database](#connection-and-database)
- [Routes](#routes)
  - [Create Routes](#create-routes)
- [Test](#test)
  - [Setup](#setup)
- [npm Scripts](#npm-scripts)

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/mogbeyi-david/softcom-takehome-test.git
```

then

```sh
# cd into project root
$ npm install
$ npm start
```

## Folder Structure

This codebase has the following directories:

- api - for controllers and routes.
- config - Settings for any external services or resources.
- helper - Contains functions to support the controllers
- logs - Output of API logs are found here
- middlewares - All middleware functions for authentication, authorization etc
- models - Database schema definitions, plugins and model creation
- repositories - Wrappers for database functions (Similar to DAO)
- scripts - Executable files specifying automated deployment process
- services - Wrapper classes and methods for external services
- tests - Automated tests for the project
- Utility - Functions used often in codebase and tests
- validations Request payload validation at API level


## Repositories

### Create a repository

Repositories are wrappers around the models and use dependency injection to take the model as input
I used [Mongoose](https://mongoosejs.com) as ODM, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).
Example Controller for all **CRUD** operations:


```js
const User = require('../models/User');

class UserRepository
{

    /**
     *
     * @param user
     */
    constructor(user)
    {
        this.user = user;
    }

    /**
     *
     * @param user
     * @returns {Promise<void>}
     */
    async create(user)
    {
        return await this.user.create(user);
    }

    /**
     *
     * @param email
     * @returns {Bluebird<TInstance | T>}
     */
    async findByEmail(email)
    {
        return await this.user.findOne({email});
    }

    /**
     *
     * @returns {Promise<*>}
     */
    async findAll()
    {
        return await this.user.find({}, {password: false, isAdmin: false}).
            lean();
    }

    /**
     *
     * @param id
     * @returns {Promise<*|TInstance|T>}
     */
    async findOne(id)
    {
        return await this.user.findOne({_id: id});
    }

    /**
     *
     * @param user
     * @param id
     * @returns {Promise<void>}
     */
    async update(user, id)
    {
        return await this.user.findOneAndUpdate({_id: id}, user, {new: true});
    }

    /**
     *
     * @param query
     * @returns {Promise<void|Promise>}
     */
    async search(query)
    {
        return this.user.esSearch({
            query_string: {
                query,
            },
        });
    }

}

module.exports = new UserRepository(User);

```

## Controllers

### Create a Controller

Controllers in the codebase have a naming convention: `ModelnameController.js` and uses an ES6 class pattern.
To use a model functions inside the controller, require the repository in the controller and use it. The controller should not have direct access to the Model except through the repository


Example Controller for all **CRUD** operations:

```js
const status = require('http-status');
const _ = require('lodash');
const mongoose = require('mongoose');

const UserRepository = require('../../../repositories/UserRepository');

const validateCreateUser = require(
    '../../../validations/user/validate-create-user');
const validateUpdateUser = require(
    '../../../validations/user/validate-update-user');
const response = require('../../../utility/response');
const hasher = require('../../../utility/hasher');
const handleCall = require('../../../helper/handleCall');

class UserController
{

    /**
     * @Author David Mogbeyi
     * @Responsibility: Creates a new user
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async create(req, res, next)
    {

        const {error} = validateCreateUser(req.body); // Check if the request payload meets specifications
        if (error) {
            return response.sendError({res, message: error.details[0].message});
        }
        let {firstname, lastname, email, password} = req.body;
        return handleCall((async () => {
            const existingUser = await UserRepository.findByEmail(email);
            if (existingUser) {
                return response.sendError(
                    {res, message: 'User already exists'});
            }
            password = await hasher.encryptPassword(password);
            const result = await UserRepository.create(
                {firstname, lastname, email, password});
            const user = _.pick(result,
                ['_id', 'firstname', 'lastname', 'email']);
            return response.sendSuccess({
                res,
                message: 'User created successfully',
                body: user,
                statusCode: status.CREATED,
            });
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getAll(req, res, next)
    {
        return handleCall((async () => {
            const users = await UserRepository.findAll();
            return response.sendSuccess(
                {res, body: users, message: 'All users'});
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async getOne(req, res, next)
    {
        return handleCall((async () => {
            let {id} = req.params;
            id = mongoose.Types.ObjectId(id);
            const result = await UserRepository.findOne(id);
            if (!result) {
                return response.sendError({
                    res,
                    message: 'User not found',
                    statusCode: status.NOT_FOUND,
                });
            }
            // Send only in-sensitive data back to the client.
            const user = _.pick(result,
                ['_id', 'firstname', 'lastname', 'email']);
            return response.sendSuccess(
                {res, body: user, message: 'Single user gotten successfully'});
        }), next);
    }

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async update(req, res, next)
    {
        return handleCall((async () => {
            const {error} = validateUpdateUser(req.body);
            if (error) return response.sendError(
                {res, message: error.details[0].message});
            let {id} = req.params;
            let {firstname, lastname, email, oldPassword, newPassword, confirmNewPassword} = req.body;
            const existingUser = await UserRepository.findOne(id);
            if (!existingUser) {
                return response.sendError({
                    res,
                    message: 'User does not exist',
                    statusCode: status.NOT_FOUND,
                });
            }

            if (newPassword !== confirmNewPassword) return response.sendError(
                {res, message: 'Passwords do not match'});

            if (newPassword !== '') {
                if (!await hasher.comparePasswords(oldPassword,
                    existingUser.password)) {
                    return response.sendError(
                        {res, message: 'Old password is not correct'});
                }
                if (!/^[a-zA-Z0-9]{3,30}$/.test(newPassword)) {
                    return response.sendError(
                        {res, message: 'Password is not secure enough'});
                }
            }
            let user = {firstname, lastname, email};
            if (newPassword) {
                user.password = newPassword;
            }
            const result = await UserRepository.update(user, id);
            user = _.pick(result, ['firstname', 'lastname', 'email']);
            return response.sendSuccess({
                res,
                message: 'User details updated successfully',
                body: user,
            });
        }), next);
    }

}

module.exports = new UserController;

```

## Models

### Create a Model

Models in this boilerplate have a naming convention: `Model.js` and uses [Mongoose](https://mongoosejs.com) to define our Models, if you want further information read the [Docs](https://mongoosejs.com/docs/guide.html).

Example User Model:

```js
require("dotenv").config();
const mongoose = require("mongoose");
const mexp = require("mongoose-elasticsearch-xp").v7;
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


const UserSchema = new Schema({
	firstname: {
		type: String,
		required: true,
		es_indexed: true
	},
	lastname: {
		type: String,
		required: true,
		es_indexed: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		es_indexed: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
}, {timestamps: true});

UserSchema.methods.generateJsonWebToken = function () {
	return jwt.sign({
		userId: this._id,
		firstname: this.firstname,
		lastname: this.lastname,
		email: this.email,
		isAdmin: this.isAdmin
	}, JWT_SECRET_KEY);
};

UserSchema.plugin(mexp);

// Creates the user model
const User = mongoose.model("User", UserSchema);
module.exports = User;

```

## Middlewares

Middleware are functions that can run before hitting a route.

Example middleware:

Only allow if the user is logged in

> Note: this is not a secure example, only for presentation purposes

```js
require("dotenv").config();
const status = require("http-status");
const jwt = require("jsonwebtoken");

const response = require("../utility/response");

const auth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return response.sendError({
			res,
			statusCode: status.UNAUTHORIZED,
			message: "You need to be signed in to perform this operation"
		});
	}
	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
		next();
	} catch (exception) {
		next(exception);
	}
};

module.exports = auth;

```

To use this policy on all routes that only admins are allowed:

api.js

```js
const SubscriptionController = require("../controllers/SubscriptionController");
const authMiddleware = require("../../../middlewares/auth");

router.post("/question", [authMiddleware], SubscriptionController.subscribeToQuestion);
```

Or to use several middlewares for one route

api.js

```js
const SubscriptionController = require("../controllers/SubscriptionController");
const authMiddleware = require("../../../middlewares/auth");
const adminMiddleware = require("../../../middlewares/admin");

router.post("/question", [authMiddleware], SubscriptionController.subscribeToQuestion);
router.get("/question/:id", [authMiddleware, adminMiddleware], SubscriptionController.getAllForQuestion);

module.exports = router;

```

## auth.middleware

The `auth.middleware` checks whether a `JSON Web Token` ([further information](https://jwt.io/)) is send in the header of an request as `x-auth-token`.
The middleware runs default on all api routes as specified in the route.

## admin.middleware

The `admin.middleware` checks whether a the decoded version of the `JSON Web Token` ([further information](https://jwt.io/)) has the isAdmin property set to `1`.
The middleware runs default on all api routes as specified in the route.


## Services

Services are wrapper classes around external tools like [RabbitMQ](https://www.rabbitmq.com) used in the project

Example service:

Publish data to RabbitMQ
```js
const connectionString = require("../config/rabbitmq/connection");
const open = require("amqplib").connect(connectionString);

class RabbitMqService {

	/**
     *
     * @param queue
     * @param data
     */
	static publish(queue, data) {
		open.then(function (conn) {
			return conn.createChannel();
		}).then(function (ch) {
			//eslint-disable-next-line
			return ch.assertQueue(queue).then(function (ok) {
				return ch.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
			});
		}).catch(console.warn);
	}
}

module.exports = RabbitMqService;
```

## Config

Holds all the server and service configurations.

## Connection and Database

> Note: if you use MongoDB make sure mongodb server is running on the machine
This two files are the way to establish a connection to a database.
Now simple configure the keys with your credentials from environment variables

```js
require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
let connectionString;

switch (environment) {
case "production":
	connectionString = "";
	break;
case "testing":
	connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`;
	break;
default:
	connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

module.exports = connectionString;

```

To not configure the production code.

To start the DB, add the credentials for production. add `environment variables` by typing e.g. `export DB_USER=yourusername` before starting the api or just include credentials in the env file

## Routes

Here you define all your routes for your api.

## Create Routes

For further information read the [guide](https://expressjs.com/en/guide/routing.html) of express router.

Example for User Resource:

> Note: Only supported Methods are **POST**, **GET**, **PUT**, and **DELETE**.

userRoutes.js

```js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../../../middlewares/auth');
const validateObjectIdMiddleware = require(
    '../../../middlewares/validate-objectId');

router.post('/forgot-password', AuthController.sendResetPasswordLink);
router.post('/reset-password', AuthController.resetPassword);
router.post('/login', AuthController.login);
router.post('/', UserController.create);

router.get('/', UserController.getAll);
router.get('/:id', [validateObjectIdMiddleware], UserController.getOne);

router.put('/:id', [validateObjectIdMiddleware], UserController.update);

module.exports = router;
```

To use these routes in your application, require the router in the routes/index.js file, give it an alias and export it to app.js

```js
const userRouter = require("./user");
const questionRouter = require("./question");
const answerRouter = require("./answer");
const subscriptionRouter = require("./subscription");
const searchRouter = require("./search");


module.exports = {
	userRouter,
	questionRouter,
	answerRouter,
	subscriptionRouter,
	searchRouter
};

```
app.js
```js
const {userRouter: userRouterV1} = require("./api/v1/routes");
const {questionRouter: questionRouterV1} = require("./api/v1/routes");
const {answerRouter: answerRouterV1} = require("./api/v1/routes");
const {subscriptionRouter: subscriptionRouterV1} = require("./api/v1/routes");
const {searchRouter: searchRouterV1} = require("./api/v1/routes");
```

## Test

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So please read their docs on further information.

### Controller

> Note: those request are asynchronous, we use `async await` syntax.

> Note: As we don't use import statements inside the api we also use the require syntax for tests

> All controller actions are wrapped in a function to avoid repetitive try...catch syntax

To test a Controller we create `requests` to our api routes.

Example `GET /user` from last example with prefix `prefix`:

```js
const request = require('supertest');
const {
  beforeAction,
  afterAction,
} = require('../setup/_setup');

let api;

beforeAll(async () => {
  api = await beforeAction();
});

afterAll(() => {
  afterAction();
});

test('test', async () => {
  const token = 'this-should-be-a-valid-token';

  const response = await request(server)
  				.put(`${baseURL}/${testQuestion._id}`)
  				.set("x-auth-token", token)
  				.send(payload);
  			expect(response.status).toEqual(401);
});
```

### Models

Are usually automatically tested in the integration tests as the Controller uses the Models, but you can test them seperatly.

## npm scripts

There are no automation tool or task runner like [grunt](https://gruntjs.com/) or [gulp](http://gulpjs.com/) used for this project. This project only uses npm scripts for automation.

### npm start

This is the entry for a developer. This command:

- runs **nodemon watch task** for the all files connected to the codebase
- sets the **environment variable** `NODE_ENV` to `development`
- opens the db connection for `development`
- starts the server on `localhost`

### npm test

This command:

- sets the **environment variable** `NODE_ENV` to `testing`
- creates the `test database`
- runs `jest --coverage --runInBand` for testing with [Jest](https://github.com/facebook/jest) and the coverage
- drops the `test database` after the test

## npm run production

This command:

- sets the **environment variable** to `production`
- opens the db connection for `production`
- starts the server on 127.0.0.1 or on 127.0.0.1:PORT_ENV

Before running on any environment you have to set the **environment variables**:

```dotenv
NODE_ENV=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=
TEST_DB_NAME=
DB_FOR_LOGS=
PORT=
JWT_SECRET_KEY=
APP_URL=
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
APP_EMAIL=
APP_EMAIL_PASSWORD=
EMAIL_HOST=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_HOST=
RABBITMQ_PORT=
ELASTIC_SEARCH_PORT=
RESET_PASSWORD_QUEUE="

```
## LICENSE

MIT © Stack Overflow Lite Api
