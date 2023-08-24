// const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const { hashPassword } = require('../utils/auth')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length >= 3) {

    // const saltRounds = 10
    const passwordHash = await hashPassword(password)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } else {
    response.status(400).json({ error: 'Password less than 3 characters long' })
  }


})

module.exports = usersRouter