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

        it("should return a 400 if the payload does not pass a question", async () => {
            const badUserPayload = {};
            const response = await request(server)
                .post(baseURL)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
        });


    });

});
