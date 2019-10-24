import "babel-polyfill";

let server;
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/User");
const Question = require("../../models/Question");
const Answer = require("../../models/Answer");
const hasher = require("../../utility/hasher");


describe("Answer Resource", () => {

    beforeEach(() => {
        server = require("../../app");
    });

    afterEach(async () => {
        server.close();
        await User.remove({});
    });

    const baseURL = "/api/v1/answers";

    describe("Answering a question", () => {

        it("should return 401 if the client is not logged in", async () => {
            const payload = {};
            const response = await request(server)
                .post(baseURL)
                .send(payload);
            expect(response.status).toEqual(401);
        });

        it("should return a 400 if the payload does not have an answer", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {
                question: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(baseURL)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(400);
            expect(response.body.message).toMatch(/required/i);
        });

        it("should return a 400 if the payload does not have a question", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {
                answer: "Call the ID dynamixally"
            };
            const response = await request(server)
                .post(baseURL)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(400);
            expect(response.body.message).toMatch(/required/i);
        });
    })

});
