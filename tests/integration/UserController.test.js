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
    });


});
