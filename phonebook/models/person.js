const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    validate: {
      validator: function (name) {
        return /\S+/.test(name)
      },
      message: 'Name must contain not only whitespaces.'
    },
    required: [true, 'Name must be defined']
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (number) {
        return /\d{2,3}-\d+$/.test(number)
      },
      message: 'Number must be formed of two parts that are separated by -, the first part has two or three numbers and the second part also consists of numbers.'
    },
    required: [true, 'Number must be defined']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)