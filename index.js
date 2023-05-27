const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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
morgan.token('body', function getId (req) {
  return JSON.stringify(req.body)
})

//middleware
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(requestLogger)


const port = 3999

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/', (req, res) => {
  res.send(`Yea, that's the biznuss`)
})

app.get('/info', (req, res) => {

  let date = new Date()
  let count = persons.length

  res.send(`<p>phonebook has info for ${count} ${count === 1 ? 'person' : 'people'}</p><p>${date}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.send(persons)
})

app.get('/api/persons/:id', (req, res) => {
  let person = persons.find(p => p.id === parseInt(req.params.id))

  if (person) {
    res.send(person)
  } else {
    res.sendStatus(404).send(`No person found with id ${req.params.id}`);
  }
})


app.post('/api/persons', (req, res) => {
  let id = persons.map(p => p.id).reduce((x, y) => Math.max(x, y), 1) + 1
  let newPerson = { ...req.body, "id": id }



  let errors = {
    "missing number": !newPerson.number,
    "missing name": !newPerson.name,
    "name already exists": persons.find(p => p.name === newPerson.name) ? true : false
  }

  let getErrors = (errs) => {
    const errorsArray = [];

    for (const key in errs) {
      if (errs.hasOwnProperty(key) && errs[key] === true) {
        errorsArray.push(key);
      }
    }

    return errorsArray;
  }

  let errorArray = getErrors(errors)

  if (newPerson && errorArray.length === 0) {
    persons = persons.concat(newPerson)
    //
    //automatically sets the appropriate headers in the response to indicate that the data being sent is in JSON format.
    res.json(newPerson)
    //automatically sets the appropriate headers in the response to indicate that the data being sent is in JSON format.
    //
  } else {
    return res.status(404).json({
      errors: errorArray
    })
  }
})

app.delete('/api/persons/:id', (req, res) => {

  let id = parseInt(req.params.id)
  let person = persons.find(p => p.id === id)

  if (person) {
    persons = persons.filter(p => p.id !== id)
    res.sendStatus(200).send('Deleted a motherfucker')
  } else {
    res.sendStatus(404).send(`No person found with id ${id}`)
  }
})

app.use((req, res, next) => {
  res.status(404).send("This route doesn't exist")
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

