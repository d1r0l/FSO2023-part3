require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const Person = require('./models/person')

const PORT = process.env.PORT;
const app = express();

app.use(express.static('build'))
app.use(express.json());
app.use(cors())

morgan.token("body", function (request, response) {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/info", (request, response) => {
  response.send(`
      <p>
        Phonebook has info for ${persons.length} people
      </p>
      <p>
        ${Date()}
      </p>
    `);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  }); 
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  if (persons.find((person) => Number(person.id) === id) !== undefined) {
    persons = persons.filter((person) => person.id !== id);
    response.status(200).end();
  } else {
    response.status(204).end();
  }
});

app.post("/api/persons", (request, response) => {
  const newPerson = request.body;
  if (newPerson.name === undefined || !(typeof newPerson.name === "string") || newPerson.name.trim() === "") {
    response.send("Name must be defined.").status(204).end();
  } else if (newPerson.number === undefined || newPerson.number.trim() === "" || newPerson.name.trim() === "") {
    response.send("Number must be defined.").status(204).end();
  } else if (persons.find((person) => person.name === newPerson.name)) {
    response.send("Name must be unique.").status(204).end();
  } else if (persons.find((person) => person.number === newPerson.number)) {
    response.send("Number must be unique.").status(204).end();
  } else {
    const newId = Math.floor(Math.random() * 10000000);
    savedPerson = {
      id: newId,
      name: newPerson.name,
      number: newPerson.number
    };
    persons = persons.concat(savedPerson);
    response.json(savedPerson);
  }
});