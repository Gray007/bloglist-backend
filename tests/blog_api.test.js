const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')
const { getTokenandID } = require('../utils/auth')

let token
let userID

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {

        await Blog.deleteMany({})
        const blogObjects = helper.initialBlogs
            .map(blog => new Blog(blog))

        const promiseArray = blogObjects.map(blog => blog.save())

        await Promise.all(promiseArray)
    })

    test('correct amount of blogs are returned as json', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('each blog should have a defined id property', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('addition of a new blog', () => {

    beforeEach(async () => {

        await Blog.deleteMany({})
        await helper.initializeUsers();

        [token, userID] = await getTokenandID(helper.initialUsers[0].username)

        const blogObjects = helper.initialBlogs
            .map(blog => new Blog({ ...blog, user: userID }))

        const promiseArray = blogObjects.map(blog => blog.save())

        await Promise.all(promiseArray)
    })
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'The title',
            author: 'Sir Sneppy the 3rd',
            user: `${userID}`,
            url: '/title',
            likes: 100
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(r => ({
            title: r.title,
            author: r.author,
            url: r.url,
            likes: r.likes,
        }))

        expect(contents).toContainEqual({
            title: 'The title',
            author: 'Sir Sneppy the 3rd',
            url: '/title',
            likes: 100
        })
    })

    test('blog without authorization/token is not added', async () => {
        const newBlog = {
            title: 'The title',
            author: 'Sir Sneppy the 3rd',
            url: '/title',
            likes: 100
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('verify the likes property defaults to 0', async () => {

        const newBlog = {
            title: "Dani Cali",
            author: 'Not Sneppy',
            user: `${userID}`,
            url: '/danicali',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const blogToView = blogsAtEnd[helper.initialBlogs.length]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(resultBlog.body.likes).toEqual(0)
    })

    test('blog without url is not added', async () => {
        const newBlog = {
            title: "Something",
            author: 'Sneppy Forever',
            user: `${userID}`,
            likes: 5
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('blog without title is not added', async () => {
        const newBlog = {
            author: 'Sneppy Forever',
            user: `${userID}`,
            url: '/something',
            likes: 5
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
})

describe('deletion of a blog', () => {
    beforeEach(async () => {

        await Blog.deleteMany({})
        await helper.initializeUsers();

        [token, userID] = await getTokenandID(helper.initialUsers[0].username)

        const blogObjects = helper.initialBlogs
            .map(blog => new Blog({ ...blog, user: userID }))

        const promiseArray = blogObjects.map(blog => blog.save())

        await Promise.all(promiseArray)
    })

    test('deleting a specific blog removes it from the database', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length - 1
        )

        const titles = blogsAtEnd.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.title)

    })
})

describe('updating of a blog', () => {
    test('updating the likes of a specific blog', async () => {
        const updatedBlog = {
            // title: "Something",
            // author: 'Sneppy Forever',
            likes: 5
        }
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)

        const response = await api
            .get(`/api/blogs/${blogToUpdate.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.likes).toEqual(5)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})