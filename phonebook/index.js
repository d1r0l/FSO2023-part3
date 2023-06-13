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
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
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

app.post("/api/persons", async (request, response) => {
  const nameFindQuery = await Person.find({ name: request.body.name });
  const numberFindQuery = await Person.find({ number: request.body.number });

  if (
    request.body.name === undefined ||
    !(typeof request.body.name === "string") ||
    request.body.name.trim() === ""
  ) {
    response.status(422).send("Name must be defined.").end();
  } else if (
    request.body.number === undefined ||
    !(typeof request.body.number === "string") ||
    request.body.number.trim() === ""
  ) {
    response.status(422).send("Number must be defined.").end();
  } else if (nameFindQuery[0]?.name) {
    response.status(422).send("Name must be unique.").end();
  } else if (numberFindQuery[0]?.number) {
    response.status(422).send("Number must be unique.").end();
  } else {
    const person = new Person({
      name: request.body.name,
      number: request.body.number,
    });
    person.save().then((result) => {
      console.log(`Added ${result.name} number ${result.number} to phonebook`);
      response.json(result);
    });
  }
});