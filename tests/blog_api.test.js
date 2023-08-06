const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')

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

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'The title',
        author: 'Sir Sneppy the 3rd',
        url: '/title',
        likes: 100
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
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


test('verify the likes property defaults to 0', async () => {

    const newBlog = {
        title: "Dani Cali",
        author: 'Not Sneppy',
        url: '/danicali',
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
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
        likes: 5
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog without title is not added', async () => {
    const newBlog = {
        author: 'Sneppy Forever',
        url: '/something',
        likes: 5
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
    await mongoose.connection.close()
})