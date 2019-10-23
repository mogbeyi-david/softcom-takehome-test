const mongoose = require("mongoose");
let server;
const request = require("supertest");
const User = require("../../models/User");
const hasher = require("../../utility/hasher");

describe("USER RESOURCE", () => {

    beforeEach(() => {
        server = require("../../app");
    });

    afterEach(async () => {
        server.close();
        await User.remove({});
    });

    const baseURL = "/api/v1/users";

    describe("Setting Up", () => {
        it("should set node environment to testing", function () {
            expect(process.env.NODE_ENV).toBe("testing");
        });

        it("should ping the API", async () => {
            const response = await request(server)
                .get("/health-check");
            expect(response.status).toEqual(200);
        });
    });

    describe("Creating a user", () => {
        it("should return 400 if required payload parameters are missing", async () => {
            const badUserPayload = {
                firstname: "Test_Firstname",
                email: "Test_Email",
                password: "Test_Password"
            };
            const response = await request(server)
                .post(baseURL)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
        });

        it("should return 400 if the user already exists", async () => {

            await User.insertMany([
                {
                    firstname: "Test_Firstname",
                    lastname: "Test_Lastname",
                    email: "test@gmail.com",
                    password: "boozai234"
                }
            ]);

            const badUserPayload = {
                firstname: "Test_Firstname",
                lastname: "Test_Lastname",
                email: "test@gmail.com",
                password: "boozai234"
            };
            const response = await request(server)
                .post(baseURL)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
            expect(response.body.message).toEqual("User already exists");
        });

        it("should return 201 for a proper payload", async () => {

            const properPayload = {
                firstname: "Test_Firstname",
                lastname: "Test_Lastname",
                email: "test@email.com",
                password: "boozai233"
            };
            const response = await request(server)
                .post(baseURL)
                .send(properPayload);
            expect(response.status).toEqual(201);
        });
    });

    describe("Logging in a User", () => {
        it("should return 400 if the payload does not contain email", async () => {
            const badUserPayload = {
                password: "boozai234"
            };
            const response = await request(server)
                .post(`${baseURL}/login`)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
        });

        it("should return 400 the passwords does not match the one in the DB", async () => {

            await User.insertMany([
                {
                    firstname: "Test_Firstname",
                    lastname: "Test_Lastname",
                    email: "test@email.com",
                    password: await hasher.encryptPassword("boozai234")
                }
            ]);

            const badUserPayload = {
                email: "test@email.com",
                password: "boozai2345"
            };
            const response = await request(server)
                .post(`${baseURL}/login`)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
        });

        it("should return 400 if the user does not exist", async () => {
            const badUserPayload = {
                email: "test@email.com",
                password: "boozai234"
            };
            const response = await request(server)
                .post(`${baseURL}/login`)
                .send(badUserPayload);
            expect(response.status).toEqual(400);
        });

        it("should return 200 if the user exists", async () => {


            await User.insertMany([
                {
                    firstname: "Test_Firstname",
                    lastname: "Test_Lastname",
                    email: "test@email.com",
                    password: await hasher.encryptPassword("boozai234")
                }
            ]);

            const badUserPayload = {
                email: "test@email.com",
                password: "boozai234"
            };
            const response = await request(server)
                .post(`${baseURL}/login`)
                .send(badUserPayload);
            expect(response.status).toEqual(200);
        });
    });



});
