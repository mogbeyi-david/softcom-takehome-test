import 'babel-polyfill';

const mongoose = require("mongoose");
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


    });

});
