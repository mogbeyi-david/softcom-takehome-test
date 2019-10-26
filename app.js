require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

//Pull in custom modules
const Database = require("./config/database/Database");
const response = require("./utility/response");
const winston = require("./config/logger/winston");
const errorHandler = require("./utility/error-handler");

// Connect to the database
const connectionString = require("./config/database/connection");
new Database(connectionString).connect();

//Import routers
const {userRouter: userRouterV1} = require("./api/v1/routes");
const {questionRouter: questionRouterV1} = require("./api/v1/routes");
const {answerRouter: answerRouterV1} = require("./api/v1/routes");
const {subscriptionRouter: subscriptionRouterV1} = require("./api/v1/routes");
const {searchRouter: searchRouterV1} = require("./api/v1/routes");

//Initialize express application
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(morgan("combined", {stream: winston.stream}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

//Ping the API to ensure it is running.
app.get("/health-check", (req, res) => {
	return response.sendSuccess({res, message: "Health checks passed"});
});

//Bind app entry points to routers
app.use("/api/v1/users", userRouterV1);
app.use("/api/v1/questions", questionRouterV1);
app.use("/api/v1/answers", answerRouterV1);
app.use("/api/v1/subscriptions", subscriptionRouterV1);
app.use("/api/v1/search", searchRouterV1);

// Use the error handling middleware as the last in the middleware stack
app.use((error, req, res, next) => {
	res.locals.message = error.message;
	res.locals.error = process.env.NODE_ENV === "development" ? error : {};
	winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
	return errorHandler.handle(error, req, res, next);
});

// Declare port and run the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
module.exports = server;
