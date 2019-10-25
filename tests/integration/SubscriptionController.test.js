import "babel-polyfill";

let server;
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/User");
const Answer = require("../../models/Answer");
const Subscription = require("../../models/Subscription");
const Question = require("../../models/Question");
const hasher = require("../../utility/hasher");


describe("Question Resource", () => {

    beforeEach(() => {
        server = require("../../app");
    });

    afterEach(async () => {
        server.close();
        await Subscription.deleteMany({});
        await Question.deleteMany({});
        await User.deleteMany({});
        await Answer.deleteMany({});
    });

    const baseURL = "/api/v1/subscriptions";

    describe("Create a new subscription", () => {

        it("should return a 401 if the client is not logged in", async () => {
            const payload = {};
            const response = await request(server)
                .post(`${baseURL}/question`)
                .send(payload);
            expect(response.status).toEqual(401);
            expect(response.body.message).toEqual("You need to be signed in to perform this operation");
        });

        it("should return a 400 if the payload does not have a question", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {
                user: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(`${baseURL}/question`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(400);
        });

        it("should return a 400 if the payload does not have a user", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {
                question: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(`${baseURL}/question`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(400);
        });
        it("should return a 404 if the user does not exist", async () => {
            const token = (new User()).generateJsonWebToken();
            const payload = {
                question: mongoose.Types.ObjectId(),
                user: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(`${baseURL}/question`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(404);
        });

        it("should return a 404 if the question does not exist", async () => {
            const testUser = await User.create({
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: await hasher.encryptPassword("boozai123")
            });
            const token = testUser.generateJsonWebToken();
            const payload = {
                question: mongoose.Types.ObjectId(),
                user: mongoose.Types.ObjectId()
            };
            const response = await request(server)
                .post(`${baseURL}/question`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(404);
        });

        it("should return a 200 for a valid payload", async () => {
            const testUser = await User.create({
                firstname: "test_firstname",
                lastname: "test_lastname",
                email: "test@email.com",
                password: await hasher.encryptPassword("boozai123")
            });

            const testQuestion = await Question.create({
                question: "test question",
                user: testUser._id
            });
            const token = testUser.generateJsonWebToken();
            const payload = {
                question: testQuestion._id,
                user: testUser._id
            };
            const response = await request(server)
                .post(`${baseURL}/question`)
                .set("x-auth-token", token)
                .send(payload);
            expect(response.status).toEqual(201);
        });
    });
});
