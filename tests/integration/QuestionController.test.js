import 'babel-polyfill';

let server;
const request = require("supertest");
const User = require("../../models/User");


describe("Question Resource", () => {

    beforeEach(() => {
        server = require("../../app");
    });

    afterEach(async () => {
        server.close();
        await User.remove({});
    });

    const baseURL = "/api/v1/questions";

    describe("Create a new question", () => {

        it("should return a 401 if the client is not logged in", async () => {
            const badQuestionPayload = {};
            const response = await request(server)
                .post(baseURL)
                .send(badQuestionPayload);
            expect(response.status).toEqual(401);
        });

        it("should return a 400 if the payload does not have a question", async () => {
            const token = (new User()).generateJsonWebToken();
            const badQuestionPayload = {};
            const response = await request(server)
                .post(baseURL)
                .set('x-auth-token', token)
                .send(badQuestionPayload);
            expect(response.status).toEqual(400);
        });

        it("should return a 201 if the payload is valid and client is logged in", async () => {
            const token = (new User()).generateJsonWebToken();
            const badQuestionPayload = {
                question: "What is my name?"
            };
            const response = await request(server)
                .post(baseURL)
                .set('x-auth-token', token)
                .send(badQuestionPayload);
            expect(response.status).toEqual(201);
        });
    });

});
