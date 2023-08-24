const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

// const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
    await helper.initializeUsers();
})


describe('addition of a new user', () => {
    test('user has a unique username', async () => {
        const newUser = {
            username: "TestSnep",
            name: "Sneppy",
            password: "testbagel"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
    })

    test('user has a username that is at least 3 characters long', async () => {
        const newUser = {
            username: "Sn",
            name: "Sneppy",
            password: "testbagel"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
    })

    test('user has a password that is at least 3 characters long', async () => {
        const newUser = {
            username: "SneppyTest",
            name: "Sneppy",
            password: "te"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
    })

    test('a valid user can be added', async () => {
        const newUser = {
            username: "Sneppy Added",
            name: "Sneppy",
            password: "testbagel"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)

        const contents = usersAtEnd.map(r => ({
            username: r.username,
            name: r.name
        }))

        expect(contents).toContainEqual({
            username: "Sneppy Added",
            name: "Sneppy",
        })
    })
})


afterAll(async () => {
    await mongoose.connection.close()
})