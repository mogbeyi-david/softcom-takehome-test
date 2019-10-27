import 'babel-polyfill'

let server
const mongoose = require('mongoose')
const request = require('supertest')
const User = require('../../models/User')
const Question = require('../../models/Question')
const Subscription = require('../../models/Subscription')
const Answer = require('../../models/Answer')
const hasher = require('../../utility/hasher')

describe('Question Resource', () => {

    beforeEach(() => {
        server = require('../../app')
    })

    afterEach(async () => {
        server.close()
        await Subscription.deleteMany({})
        await Question.deleteMany({})
        await User.deleteMany({})
        await Answer.deleteMany({})
    })

    const baseURL = '/api/v1/search'

    describe('Search the user resource', () => {
        it('should return users with the matching query', async () => {
            await User.insertMany([
                {
                    firstname: 'test_firstname',
                    lastname: 'Test_Lastname',
                    email: 'test1@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
                {
                    firstname: 'test_firstname',
                    lastname: 'Test_Lastname',
                    email: 'test2@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
                {
                    firstname: 'does_not_match',
                    lastname: 'Test_Lastname',
                    email: 'test3@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
            ])
            const response = await request(server).
              get(`${baseURL}/user/?query=test`)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(10)
        })

        it('should return error when no record matches the query', async () => {
            await User.insertMany([
                {
                    firstname: 'test_firstname',
                    lastname: 'Test_Lastname',
                    email: 'test1@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
                {
                    firstname: 'test_firstname',
                    lastname: 'Test_Lastname',
                    email: 'test2@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
                {
                    firstname: 'does_not_match',
                    lastname: 'Test_Lastname',
                    email: 'test3@gmail.com',
                    password: await hasher.encryptPassword('boozai234'),
                },
            ])
            const response = await request(server).
              get(`${baseURL}/user/?query=methodology`)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(0)
        })

    })

    describe('Search the question resource', () => {
        it.only('should return questions with the matching query', async () => {
            await Question.insertMany([
                {
                    question: 'test_question',
                },
                {
                    question: 'test_question1',
                },
                {
                    question: 'test_question2',
                },
            ])
            const response = await request(server).
              get(`${baseURL}/question/?query=question`)
            console.log("Response Body", response.body.body)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(3)
        })

        it('should return error when no record matches the query', async () => {
            await Question.insertMany([
                {
                    question: 'test_question',
                },
                {
                    question: 'test_question1',
                },
                {
                    question: 'test_question2',
                },
            ])
            const response = await request(server).
              get(`${baseURL}/question/?query=methodology`)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(0)
        })
    })

    describe('Search the answer resource', () => {
        it('should return answers with the matching query', async () => {
            await Answer.insertMany([
                {
                    answer: 'test_answer',
                    question: mongoose.Types.ObjectId(),
                },
                {
                    answer: 'test_answer1',
                    question: mongoose.Types.ObjectId(),
                },
                {
                    answer: 'test_answer2',
                    question: mongoose.Types.ObjectId(),
                },
            ])
            const response = await request(server).
              get(`${baseURL}/answer/?query=test`)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(3)
        })

        it('should return error when no record matches the query', async () => {
            await Answer.insertMany([
                {
                    answer: 'test_answer',
                    question: mongoose.Types.ObjectId(),
                },
                {
                    answer: 'test_answer1',
                    question: mongoose.Types.ObjectId(),
                },
                {
                    answer: 'test_answer2',
                    question: mongoose.Types.ObjectId(),
                },
            ])
            const response = await request(server).
              get(`${baseURL}/user/?query=methodology`)
            expect(response.status).toEqual(200)
            expect(response.body.body.length).toEqual(0)
        })
    })
})
