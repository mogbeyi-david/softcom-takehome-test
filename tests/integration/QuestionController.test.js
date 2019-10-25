import "babel-polyfill";

let server;
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/User");
const Question = require("../../models/Question");
const Subscription = require("../../models/Subscription");
const Answer = require("../../models/Answer");
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
				.set("x-auth-token", token)
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
				.set("x-auth-token", token)
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
	});

	describe("Getting one question", () => {
		it("should return 404 if the question is not found", async () => {
			const response = await request(server)
				.get(`${baseURL}/222222222222`);
			expect(response.status).toEqual(404);
		});

		it("should return 400 for an invalid question id", async () => {
			const response = await request(server)
				.get(`${baseURL}/wew`);
			expect(response.status).toEqual(400);
		});

		it("should return 200  for a valid question", async () => {
			const testQuestion = await Question.create({
				question: "Is this a valid question",
				user: mongoose.Types.ObjectId()
			});
			const testQuestionId = testQuestion._id;
			const response = await request(server)
				.get(`${baseURL}/${testQuestionId}`);
			expect(response.status).toEqual(200);
		});
	});

	describe("Updating a question", () => {
		it("should return a 401 if the user is not logged in", async () => {
			const badQuestionPayload = {};
			const testId = mongoose.Types.ObjectId();
			const response = await request(server)
				.put(`${baseURL}/${testId}`)
				.send(badQuestionPayload);
			expect(response.status).toEqual(401);
		});

		it("should return a 400 if the payload does not have a question", async () => {
			const token = (new User()).generateJsonWebToken();
			const testId = mongoose.Types.ObjectId();
			const badQuestionPayload = {};
			const response = await request(server)
				.put(`${baseURL}/${testId}`)
				.set("x-auth-token", token)
				.send(badQuestionPayload);
			expect(response.status).toEqual(400);
		});

		it("should return a 401 if it is not the user who asked the question", async () => {
			const token = (new User()).generateJsonWebToken();
			const testUser = new User({
				firstname: "test_user",
				lastname: "test_user",
				email: "user@test.com",
				isAdmin: false,
				password: await hasher.encryptPassword("boozai1234")
			});
			let testQuestion = new Question({
				question: "Is this the first question?",
				user: testUser._id
			});
			testQuestion = await testQuestion.save();
			const payload = {
				question: "Is this the updated question?"
			};
			const response = await request(server)
				.put(`${baseURL}/${testQuestion._id}`)
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

			const testQuestion = await Question.create({
				question: "Is this a valid question",
				user: testUser._id
			});

			const testQuestionId = testQuestion._id;
			const token = testUser.generateJsonWebToken();
			const payload = {
				question: "What is my name?"
			};
			const response = await request(server)
				.put(`${baseURL}/${testQuestionId}`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(200);
		});

		it("should return a 200 if admin tries to change question", async () => {
			const testUser = await User.create({
				firstname: "testtest",
				lastname: "testtest",
				email: "testtest@gmail.com",
				password: await hasher.encryptPassword("boozai123")
			});

			const testQuestion = await Question.create({
				question: "Is this a valid question",
				user: testUser._id
			});

			const testQuestionId = testQuestion._id;

			const adminUser = await User.create({
				firstname: "testtest",
				lastname: "testtest",
				email: "testtest1@gmail.com",
				isAdmin: true,
				password: await hasher.encryptPassword("boozai123")
			});

			const token = adminUser.generateJsonWebToken();
			const payload = {
				question: "What is my name?"
			};
			const response = await request(server)
				.put(`${baseURL}/${testQuestionId}`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(200);
		});
	});

	describe("Up-voting or down-voting a question", () => {
		it("should return a 401 when an unauthenticated user tries to up-vote or down-vote a question", async () => {
			const payload = {};
			const testId = mongoose.Types.ObjectId();
			const response = await request(server)
				.put(`${baseURL}/${testId}/vote`)
				.send(payload);
			expect(response.status).toEqual(401);
		});

		it("should return a 404 for a question that does not exist", async () => {
			const token = (new User()).generateJsonWebToken();
			const payload = {};
			const testId = mongoose.Types.ObjectId();
			const response = await request(server)
				.put(`${baseURL}/${testId}/vote`)
				.set("x-auth-token", token)
				.send(payload);
			expect(response.status).toEqual(404);
		});

		it("should successfully up-vote a question", async () => {
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
			const response = await request(server)
				.put(`${baseURL}/${testQuestion._id}/vote`)
				.set("x-auth-token", token);
			expect(response.status).toEqual(200);
			expect(response.body.message).toEqual("Question up-voted successfully");
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
			const testQuestion = await Question.create({
				question: "Is this a valid question",
				user: testUser._id
			});
			const response = await request(server)
				.put(`${baseURL}/${testQuestion._id}/vote?up=0`)
				.set("x-auth-token", token);
			expect(response.status).toEqual(200);
			expect(response.body.message).toEqual("Question down-voted successfully");
			expect(response.body.body.downVotes).toEqual(1);
		});
	});
});
