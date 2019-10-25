const connectionString = require("../config/rabbitmq/connection");
const open = require('amqplib').connect(connectionString);

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
            return ch.assertQueue(queue).then(function (ok) {
                return ch.sendToQueue(queue, data);
            });
        }).catch(console.warn);
    }
}

module.exports = RabbitMqService
