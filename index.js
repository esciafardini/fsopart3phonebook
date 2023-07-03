require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()


const requestLogger = (request, response, next) => {
  console.log('---')
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

//custom morgan logging token
morgan.token('body', function getId(req) {
  return JSON.stringify(req.body)
})

//middleware
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(requestLogger)

app.get('/info', (req, res, next) => {
  res.send(`<h1>Informative Daniels</h1>`)
})

app.get('/api/persons', (_req, res, next) => {
  Person.find({})
    .then(people => { res.json(people) })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => { res.json(person) })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  //at this time, we only allow users to update phone numbers
  const personObjectId = new mongoose.Types.ObjectId(req.params.id)
  Person.findOneAndUpdate(
    { "_id": personObjectId }, //find by id
    { "number": req.body.number },
    { runValidators: true }
  ) //update the phone number
    .then(person => { res.json(person) })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  Person.create(req.body)
    .then(person => { res.json(person) })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const personObjectId = new mongoose.Types.ObjectId(req.params.id)
  Person.deleteOne({ "_id": personObjectId })
    .then(person => { res.json(person) })
    .catch(error => next(error))
})

// error and exception middlewares
app.use((req, res, next) => {
  res.status(404).send("This route doesn't exist")
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message})
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const port = process.env.PORT || 3989

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${port}`)
})

