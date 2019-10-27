import "babel-polyfill";

require("express-async-errors");

const mongoose = require("mongoose");
let server;
const request = require("supertest");
const User = require("../../models/User");
const Answer = require("../../models/Answer");
const Question = require("../../models/Question");
const Subscription = require("../../models/Subscription");
const hasher = require("../../utility/hasher");

describe("User Resource", () => {

	beforeEach(() => {
		server = require("../../app");
	});

	afterEach(async () => {
		server.close();
		await User.deleteMany({});
		await Question.deleteMany({});
		await Answer.deleteMany({});
		await Subscription.deleteMany({});
	});

	const baseURL = "/api/v1/users";

	describe("Setting Up", () => {
		it("should ping the API", async () => {
			const response = await request(server).get("/health-check");
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/passed/);
		});
	});

	describe("Creating a new user", () => {
		it("should fail if lastname is missing in the payload", async () => {
			const badUserPayload = {
				firstname: "Test_Firstname",
				email: "Test_Email",
				password: "Test_Password",
			};
			const response = await request(server).post(baseURL).send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/i);
			expect(response.body.message).toMatch(/lastname/i);
		});

		it("should fail if firstname is missing in the payload", async () => {
			const badUserPayload = {
				lastname: "Test_lastname",
				email: "Test_Email",
				password: "Test_Password",
			};
			const response = await request(server).
				post(baseURL).
				send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/i);
			expect(response.body.message).toMatch(/firstname/i);
		});

		it("should fail if the email is not properly formatted", async () => {
			const badUserPayload = {
				firstname: "Test_firstname",
				lastname: "Test_lastname",
				email: "testemail",
				password: "Test_Password",
			};
			const response = await request(server).
				post(baseURL).
				send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/valid/i);
			expect(response.body.message).toMatch(/email/i);
		});

		it("should fail if the user already exists", async () => {

			await User.insertMany([
				{
					firstname: "Test_Firstname",
					lastname: "Test_Lastname",
					email: "test@gmail.com",
					password: await hasher.encryptPassword("boozai234"),
				},
			]);

			const badUserPayload = {
				firstname: "Test_Firstname",
				lastname: "Test_Lastname",
				email: "test@gmail.com",
				password: "boozai234",
			};
			const response = await request(server).
				post(baseURL).
				send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/exists/);
		});

		it("should fail if the password does not match the required pattern",
			async () => {

				const properPayload = {
					firstname: "Test_Firstname",
					lastname: "Test_Lastname",
					email: "test@email.com",
					password: "he",
				};
				const response = await request(server).
					post(baseURL).
					send(properPayload);
				expect(response.status).toEqual(400);
				expect(response.body.message).toMatch(/pattern/);
			});

		it("should succeed if all the payload requirements are met",
			async () => {

				const properPayload = {
					firstname: "Test_Firstname",
					lastname: "Test_Lastname",
					email: "test@email.com",
					password: "boozai233",
				};
				const response = await request(server).
					post(baseURL).
					send(properPayload);
				expect(response.status).toEqual(201);
				expect(response.body.message).toMatch(/success/);
			});
	});

	describe("Logging in a User", () => {

		it("should fail if the payload does not contain email", async () => {
			const badUserPayload = {
				password: "boozai234",
			};
			const response = await request(server).
				post(`${baseURL}/login`).
				send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/);
		});

		it("should fail if the passwords does not match the one in the DB",
			async () => {

				await User.insertMany([
					{
						firstname: "Test_Firstname",
						lastname: "Test_Lastname",
						email: "test@email.com",
						password: await hasher.encryptPassword("boozai234"),
					},
				]);

				const badUserPayload = {
					email: "test@email.com",
					password: "boozai2345",
				};
				const response = await request(server).
					post(`${baseURL}/login`).
					send(badUserPayload);
				expect(response.status).toEqual(400);
				expect(response.body.message).toMatch(/Incorrect/i);
			});

		it("should fail if the user does not exist", async () => {
			const badUserPayload = {
				email: "test@email.com",
				password: "boozai234",
			};
			const response = await request(server).
				post(`${baseURL}/login`).
				send(badUserPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/Incorrect/i);
		});

		it("should pass if payload is valid", async () => {
			await User.insertMany([
				{
					firstname: "Test_Firstname",
					lastname: "Test_Lastname",
					email: "test@email.com",
					password: await hasher.encryptPassword("boozai234"),
				},
			]);

			const badUserPayload = {
				email: "test@email.com",
				password: "boozai234",
			};
			const response = await request(server).
				post(`${baseURL}/login`).
				send(badUserPayload);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/successful/);
			expect(response.header["x-auth-token"]).toBeDefined();
		});
	});

	describe("Getting all Users", () => {

		it("should return with an array of all the users", async () => {
			await User.insertMany([
				{
					firstname: "first_test_user_firstname",
					lastname: "first_test_user_lastname",
					email: "test1@email.com",
					password: await hasher.encryptPassword("boozai234"),
				},
				{
					firstname: "second_test_user_firstname",
					lastname: "second_test_user_lastname",
					email: "test2@email.com",
					password: await hasher.encryptPassword("boozai234"),
				},
			]);

			const response = await request(server).get(`${baseURL}`);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/all/i);
			expect(response.body.body.length).toEqual(2);
		});
	});

	describe("Getting one User", () => {

		it("should return 200 if the user exists", async () => {

			const testUser = await User.create({
				firstname: "test_user_firstname",
				lastname: "test_user_lastname",
				email: "test@gmail.com",
				password: "boozai234",
			});
			const testUserId = testUser._id;
			const response = await request(server).
				get(`${baseURL}/${testUserId}`);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/success/);
		});

		it("should return 404 if the user does not exists", async () => {
			const response = await request(server).
				get(`${baseURL}/222222222222`);
			expect(response.status).toEqual(404);
			expect(response.body.message).toMatch(/not found/i);
		});

	});

	describe("Updating a user's details", () => {

		it("should fail if client is not logged in", async () => {
			const badPayload = {};
			const response = await request(server).
				put(`${baseURL}/112112112121`).
				send(badPayload);
			expect(response.status).toEqual(401);
		});

		it("should return 400 if the firstname, lastname or email is missing", async () => {
			const token = (new User()).generateJsonWebToken();
			const badPayload = {};
			const response = await request(server).
				put(`${baseURL}/112112112121`).
				set("x-auth-token", token).
				send(badPayload);
			expect(response.status).toEqual(400);
		});

		it("should return 404 if the user does not exist", async () => {
			const testUser = new User({
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: "password",
			});
			const token = testUser.generateJsonWebToken();
			await testUser.save();
			const badPayload = {
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: "password",
			};
			const response = await request(server).
				put(`${baseURL}/${mongoose.Types.ObjectId()}`).set("x-auth-token", token).send(badPayload);
			expect(response.status).toEqual(404);
			expect(response.body.message).toEqual("User does not exist");
		});

		it("should return 400 if the password is wrong", async () => {
			const token = (new User()).generateJsonWebToken();
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234"),
			});
			const newUser = {
				firstname: "updated_test_firstname",
				lastname: "updated_test_lastname",
				email: "updated_test@email.com",
				password: "boozai2345",
			};
			const id = testUser._id;
			const response = await request(server).
				put(`${baseURL}/${id}`).
				set("x-auth-token", token).
				send(newUser);
			expect(response.status).toEqual(400);
		});

		it("should return 200 with the updated user details", async () => {
			const token = (new User()).generateJsonWebToken();
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234"),
			});
			const newUser = {
				firstname: "updated_test_firstname",
				lastname: "updated_test_lastname",
				email: "updated_test@email.com",
				password: "boozai234",
			};
			const id = testUser._id;
			const response = await request(server).
				put(`${baseURL}/${id}`).
				set("x-auth-token", token).
				send(newUser);
			expect(response.status).toEqual(200);
			expect(response.body.message).
				toEqual("User details updated successfully");
		});

	});

	describe("Resetting a password", () => {

		it("should fail password is not passed", async () => {
			const payload = {
				confirmPassword: "heh",
			};
			const response = await request(server).
				post(`${baseURL}/reset-password?email=mogbeyidavid@gmail.com`).
				send(payload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/);
		});

		it("should fail if email is not passed in the query string", async () => {
			const payload = {
				password: "hello",
				confirmPassword: "heh",
			};
			const response = await request(server).
				post(`${baseURL}/reset-password`).
				send(payload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/);
		});

		it("should fail if the passwords do not match", async () => {

			await User.create({
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai123"),
			});

			const payload = {
				password: "hello",
				confirmPassword: "heh",
			};

			const response = await request(server).
				post(`${baseURL}/reset-password?email=mogbeyidavid@gmail.com`).
				send(payload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toEqual("Passwords do not match");
		});

		it("should fail if the user does not exist", async () => {

			const payload = {
				password: "hello",
				confirmPassword: "hello",
			};

			const response = await request(server).
				post(`${baseURL}/reset-password?email=nonexistent@gmail.com`).
				send(payload);
			expect(response.body.message).toMatch(/exist/i);
			expect(response.status).toEqual(404);
		});

		it("should return 200 for a valid payload", async () => {

			await User.create({
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai123"),
			});

			const payload = {
				password: "hello123",
				confirmPassword: "hello123",
			};

			const response = await request(server).
				post(`${baseURL}/reset-password?email=test@email.com`).
				send(payload);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch("success");
		});
	});

	describe("Forgot Password", () => {

		it("should fail if the email is not passed", async () => {

			const payload = {};
			const response = await request(server).
				post(`${baseURL}/forgot-password`).
				send(payload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toMatch(/required/);
		});

		it("should pass if the payload is valid", async () => {
			await User.create({
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai123"),
			});

			const payload = {
				email: "test@email.com",
			};
			const response = await request(server).
				post(`${baseURL}/forgot-password`).
				send(payload);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/Please check your email/);
		});

		it("should pass if the payload is valid", async () => {
			const payload = {
				email: "test@email.com",
			};
			const response = await request(server).
				post(`${baseURL}/forgot-password`).
				send(payload);
			expect(response.status).toEqual(200);
			expect(response.body.message).toMatch(/Please check your email/);
		});
	});
});
