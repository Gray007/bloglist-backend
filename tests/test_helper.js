const Blog = require('../models/blog')
const User = require('../models/user')
const { hashPassword } = require('../utils/auth')

const initialUsers = [
  {
    username: "TestSnep",
    name: "Sneppy",
    password: "testbagel"
  }
]

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'Sneppy',
    url: '/HTML',
    likes: 14
  },
  {
    title: 'One more time with feeling',
    author: 'Sir Sneppy',
    url: '/Feelings',
    likes: 1
  }
]

const initializeUsers = async () => {
  await User.deleteMany({})

  const promiseArray = initialUsers.map(async user => {
    const passwordHash = await hashPassword(user.password)

    const newUser = new User({
      username: user.username,
      name: user.name,
      passwordHash: passwordHash,
    })

    return newUser.save()
  })

  await Promise.all(promiseArray)
}

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  initialUsers,
  initializeUsers, 
  nonExistingId, 
  blogsInDb, 
  usersInDb
}