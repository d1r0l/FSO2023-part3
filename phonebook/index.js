const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(morgan("tiny"));

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

app.get("/api/persons", (request, response) => {
  response.json(persons);
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

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  if (persons.find((person) => Number(person.id) === id) !== undefined) {
    response.json(persons.find((person) => person.id === id));
  } else {
    response.status(204).end();
  }
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
  if (newPerson.name === undefined || newPerson.name.trim() === "") {
    response.send("Name must be defined.").status(204).end();
  } else if (newPerson.number === undefined || newPerson.number.trim() === "") {
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
    response.status(200).end();
  }
});