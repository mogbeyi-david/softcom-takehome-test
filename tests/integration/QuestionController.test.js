import 'babel-polyfill';

let server;
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/User");
const Question = require("../../models/Question");


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

    describe("Get all questions", () => {
        it("should return all questions", async () => {
            await Question.insertMany([
                {
                    question: "Is this the first question?",
                    user: mongoose.Types.ObjectId()
                },
                {
                    question: "Is this the second question?",
                    user: mongoose.Types.ObjectId()
                }
            ]);

            const response = await request(server)
                .get(`${baseURL}`);
            expect(response.status).toEqual(200);
        });
    })

});
