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
		it("should ping the API", async () => {
			const response = await request(server)
				.get("/health-check");
			expect(response.status).toEqual(200);
		});
	});

	describe("Creating a new user", () => {
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

	describe("Getting all Users", () => {

		it("should return 200 with an array of all the users", async () => {
			await User.insertMany([
				{
					firstname: "first_test_user_firstname",
					lastname: "first_test_user_lastname",
					email: "test1@email.com",
					password: await hasher.encryptPassword("boozai234")
				},
				{
					firstname: "second_test_user_firstname",
					lastname: "second_test_user_lastname",
					email: "test2@email.com",
					password: await hasher.encryptPassword("boozai234")
				}
			]);

			const response = await request(server)
				.get(`${baseURL}`);
			expect(response.status).toEqual(200);
		});

	});

	describe("Getting one User", () => {

		it("should return 200 if the user exists", async () => {

			const testUser = await User.create({
				firstname: "test_user_firstname",
				lastname: "test_user_lastname",
				email: "test@gmail.com",
				password: "boozai234"
			});
			const testUserId = testUser._id;
			const response = await request(server)
				.get(`${baseURL}/${testUserId}`);
			expect(response.status).toEqual(200);
		});

		it("should return 404 if the user does not exists", async () => {
			const response = await request(server)
				.get(`${baseURL}/222222222222`);
			expect(response.status).toEqual(404);
		});

	});

	describe("Updating a user", () => {

		it("should return 400 if the firstname, lastname or email is missing", async () => {
			const badPayload = {};
			const response = await request(server)
				.put(`${baseURL}/USER_ID_GOES_HERE`)
				.send(badPayload);
			expect(response.status).toEqual(400);
		});

		it("should return 404 if the user does not exist", async () => {
			const badPayload = {
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
			};
			const testId = mongoose.Types.ObjectId();
			const response = await request(server)
				.put(`${baseURL}/${testId}`)
				.send(badPayload);
			expect(response.status).toEqual(404);
			expect(response.body.message).toEqual("User does not exist");
		});

		it("should return 400 if the newPassword and confirmNewPassword does not match", async () => {
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: "boozai234"
			});
			const badPayload = {
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				newPassword: "d",
				confirmNewPassword: ""
			};
			const id = testUser._id;
			const response = await request(server)
				.put(`${baseURL}/${id}`)
				.send(badPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toEqual("Passwords do not match");
		});

		it("should return 400 if the old password does not match the existing password", async () => {
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234")
			});
			const badPayload = {
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				oldPassword: "boozai23443",
				newPassword: "boozai234",
				confirmNewPassword: "boozai234"
			};
			const id = testUser._id;
			const response = await request(server)
				.put(`${baseURL}/${id}`)
				.send(badPayload);
			expect(response.status).toEqual(400);
		});

		it("should return 400 if the new password is not secure enough", async () => {
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234")
			});
			const badPayload = {
				firstname: "test_firstname",
				lastname: "test_lastname",
				email: "test@email.com",
				oldPassword: "boozai234",
				newPassword: "ke",
				confirmNewPassword: "ke"
			};
			const id = testUser._id;
			const response = await request(server)
				.put(`${baseURL}/${id}`)
				.send(badPayload);
			expect(response.status).toEqual(400);
			expect(response.body.message).toEqual("Password is not secure enough");
		});
		it("should return 200 with the updated user details", async () => {
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234")
			});
			const newUser = {
				firstname: "updated_test_firstname",
				lastname: "updated_test_lastname",
				email: "updated_test@email.com",
				oldPassword: "boozai234",
				newPassword: "boozai23456",
				confirmNewPassword: "boozai23456"
			};
			const id = testUser._id;
			const response = await request(server)
				.put(`${baseURL}/${id}`)
				.send(newUser);
			expect(response.status).toEqual(200);
			expect(response.body.message).toEqual("User details updated successfully");
		});

		it("should return 500 if the newPassword and confirmNewPassword is not passed", async () => {
			const testUser = await User.create({
				firstname: "test_first_name",
				lastname: "test_last_name",
				email: "test@email.com",
				password: await hasher.encryptPassword("boozai234")
			});
			const newUser = {
				firstname: "updated_test_firstname",
				lastname: "updated_test_lastname",
				email: "updated_test@email.com",
			};
			const id = testUser._id;
			const response = await request(server)
				.put(`${baseURL}/${id}`)
				.send(newUser);
			expect(response.status).toEqual(500);
		});

	});


});
