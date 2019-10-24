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

        it("should return a 404 if the answer is not found", async () => {
            const token = (new User()).generateJsonWebToken();
            const testAnswerId = mongoose.Types.ObjectId();
            const response = await request(server)
                .get(`${baseURL}/${testAnswerId}`);
            expect(response.status).toEqual(404);
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

    describe("Updating an answer", () => {
        it("should return a 401 if the user is not logged in", async () => {
            const payload = {};
            const testId = mongoose.Types.ObjectId();
            const response = await request(server)
                .put(`${baseURL}/${testId}`)
                .send(payload);
            expect(response.status).toEqual(401);
        });

        it("should return a 404 if the answer is not found", async () => {
            const token = (new User()).generateJsonWebToken();
            const testId = mongoose.Types.ObjectId();
            const payload = {
                answer: "Not found answer"
            };
            const response = await request(server)
                .put(`${baseURL}/${testId}`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(404);
        });

        it("should return a 400 if the payload does not have an answer", async () => {
            const token = (new User()).generateJsonWebToken();
            const testId = mongoose.Types.ObjectId();
            const payload = {};
            const response = await request(server)
                .put(`${baseURL}/${testId}`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(400);
        });

        it("should return a 401 if it is not the user who gave the answer", async () => {
            const token = (new User()).generateJsonWebToken();
            const testUser = new User({
                firstname: "test_user",
                lastname: "test_user",
                email: "user@test.com",
                isAdmin: false,
                password: await hasher.encryptPassword("boozai1234")
            });
            let testAnswer = new Answer({
                answer: "A new answer",
                user: testUser._id
            });
            testAnswer = await testAnswer.save();
            const payload = {
                answer: "This is the updated answer"
            };
            const response = await request(server)
                .put(`${baseURL}/${testAnswer._id}`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(401);
        });

        it("should return a 200 for a valid payload", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });

            const testAnswer = await Answer.create({
                question: mongoose.Types.ObjectId(),
                user: testUser._id,
                answer: "The updated answer"
            });

            const testAnswerId = testAnswer._id;
            const token = testUser.generateJsonWebToken();
            const payload = {
                answer: "This is the updated answer"
            };
            const response = await request(server)
                .put(`${baseURL}/${testAnswerId}`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(200);
        });

        it("should return a 200 if admin tries to change the answer", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });

            const testAnswer = await Answer.create({
                answer: "Is this a valid question?",
                user: testUser._id,
                question: mongoose.Types.ObjectId()
            });

            const testAnswerId = testAnswer._id;

            const adminUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                isAdmin: true,
                password: await hasher.encryptPassword("boozai123")
            });

            const token = adminUser.generateJsonWebToken();
            const payload = {
                answer: "Admin given answer"
            };
            const response = await request(server)
                .put(`${baseURL}/${testAnswerId}`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(200);
        });
    });

    describe("Up-voting or down-voting an answer", () => {
        it("should return a 401 when an unauthenticated user tries to up-vote or down-vote an answer", async () => {
            const payload = {};
            const testId = mongoose.Types.ObjectId();
            const response = await request(server)
                .put(`${baseURL}/${testId}/vote`)
                .send(payload);
            expect(response.status).toEqual(401);
        });

        it("should return a 404 for an answer that does not exist", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {};
            const testId = mongoose.Types.ObjectId();
            const response = await request(server)
                .put(`${baseURL}/${testId}/vote`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(404);
        });

        it("should successfully up-vote an answer", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });
            const token = testUser.generateJsonWebToken();
            const testAnswer = await Answer.create({
                answer: "this is a valid question",
                user: testUser._id,
                question: mongoose.Types.ObjectId()
            });
            const response = await request(server)
                .put(`${baseURL}/${testAnswer._id}/vote`)
                .set("x-auth-token", token);
            expect(response.status).toEqual(200);
            expect(response.body.message).toEqual("Answer up-voted successfully");
            expect(response.body.body.upVotes).toEqual(1);
        });

        it("should successfully down-vote a question", async () => {
            const testUser = await User.create({
                firstname: "testtest",
                lastname: "testtest",
                email: "testtest@gmail.com",
                password: await hasher.encryptPassword("boozai123")
            });
            const token = testUser.generateJsonWebToken();
            const testAnswer = await Answer.create({
                answer: "Is this a valid question",
                user: testUser._id
            });
            const response = await request(server)
                .put(`${baseURL}/${testAnswer._id}/vote?up=0`)
                .set("x-auth-token", token);
            expect(response.status).toEqual(200);
            expect(response.body.message).toEqual("Answer down-voted successfully");
            expect(response.body.body.downVotes).toEqual(1);
        });
    });

});
