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
        await Answer.remove({});
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

        it("should return a 400 if the question does not exist", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });
            const token = testUser.generateJsonWebToken();
            const payload = {
                answer: "I have already answered",
                question: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(baseURL)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(404);
            expect(response.body.message).toMatch(/not/i);
        });

        it("should return a 200 if the payload is valid", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });
            const token = testUser.generateJsonWebToken();
            const testQuestion = await Question.create({
                question: "Is this a valid question",
                user: testUser._id
            });
            const payload = {
                answer: "I have already answered",
                question: testQuestion._id
            };
            const response = await request(server)
                .post(baseURL)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(200);
            expect(response.body.message).toMatch(/success/i);
            expect(response.body.body.answer).toEqual("I have already answered");
        });
    });

    describe("Get all answers", () => {
        it("should return all answers", async () => {
            await Answer.insertMany([
                {
                    question: mongoose.Types.ObjectId(),
                    answer: "This is the first answer"
                },
                {
                    question: mongoose.Types.ObjectId(),
                    answer: "This is the second answer"
                }
            ]);

            const response = await request(server)
                .get(baseURL);
            expect(response.status).toEqual(200);
            expect(response.body.message).toMatch(/answers/i);
            expect(response.body.body.length).toEqual(2);
        });
    });

    describe("Get one answer", () => {
        it("should return an answer", async () => {
            const answer = await Answer.create({
                question: mongoose.Types.ObjectId(),
                answer: "This is the new method"
            });
            const response = await request(server)
                .get(`${baseURL}/${answer._id}`);
            expect(response.status).toEqual(200);
            expect(response.body.message).toMatch(/answer/i);
            expect(response.body.body.answer).toEqual("This is the new method");
        });
    });

    describe("Get all answers for one question", () => {

        it("should return an answer", async () => {
            const firstQuestionId = mongoose.Types.ObjectId();
            const secondQuestionId = mongoose.Types.ObjectId();
            await Answer.insertMany([
                {
                    question: firstQuestionId,
                    answer: "This is the first answer"
                },
                {
                    question: secondQuestionId,
                    answer: "This is the second answer"
                },
                {
                    question: firstQuestionId,
                    answer: "This is the third answer"
                },
            ]);
            const response = await request(server)
                .get(`${baseURL}/question/${firstQuestionId}`);
            expect(response.status).toEqual(200);
            expect(response.body.message).toMatch(/answers/i);
            expect(response.body.body.length).toEqual(2);
        });
    })

});
