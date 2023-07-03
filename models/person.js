const mongoose = require('mongoose')

const url = process.env.URL

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(result => { console.log('connected to MongoDB') })
  .catch((error) => { console.log('error connecting to MongoDB:', error.message) })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You need to have a name'],
    minLength: [3, 'Length of name must be 3 or more'],
    unique: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'You need to have a number']
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
