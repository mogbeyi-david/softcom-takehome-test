require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

//Pull in custom modules
const response = require("./utility/response");
const winston = require("./config/logger/winston");
const errorHandler = require("./utility/error-handler");

// Connect to the database
const Database = require("./config/database/Database");
const connectionString = require("./config/database/connection");
new Database(connectionString).connect();

//Initialize express application
const app = express();

// Use middlewares
app.use(morgan("combined", {stream: winston.stream}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

//Ping the API to ensure it is running.
app.get("/health-check", (req, res) => {
    return response.sendSuccess({res});
});

// Use the error handling middleware as the last in the middleware stack
app.use(function (error, req, res, next) {
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
