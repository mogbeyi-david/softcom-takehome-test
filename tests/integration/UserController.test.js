const mongoose = require("mongoose");
let server;
const request = require("supertest");
const User = require("../../models/User");
const hasher = require("../../utility/hasher");

describe("User Resource", () => {

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


})
