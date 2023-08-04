const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, currentBlog) => sum + currentBlog.likes, 0)
}

const favouriteBlog = (blogs) => {
    return blogs.reduce((max, currentBlog) =>
    (currentBlog.likes > max.likes
        ? { title: currentBlog.title, author: currentBlog.author, likes: currentBlog.likes }
        : max
    ), { likes: 0 })
}

const mostBlogs = (blogs) => {
    const blogsByAuthor = _.mapValues(_.groupBy(blogs, 'author'), (blogsArray) => blogsArray.length)
    const authorWithMostBlogs = _.maxBy(_.keys(blogsByAuthor), (author) => blogsByAuthor[author])

    return blogs.length === 0
        ? 0
        : {
            author: authorWithMostBlogs,
            blogs: blogsByAuthor[authorWithMostBlogs]
        }
}

const mostLikes = (blogs) => {
    const likesByAuthor = _.mapValues(_.groupBy(blogs, 'author'), (blogsArray) =>
        _.sumBy(blogsArray, 'likes')
    )

    const authorWithMostLikes = _.maxBy(_.keys(likesByAuthor), (author) => likesByAuthor[author])

    return blogs.length === 0
        ? 0
        : {
            author: authorWithMostLikes,
            likes: likesByAuthor[authorWithMostLikes]
        }
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}