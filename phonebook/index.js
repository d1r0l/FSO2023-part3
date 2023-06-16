require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const Person = require("./models/person");

const PORT = process.env.PORT;

app.use(express.static("build"));
app.use(express.json());

let persons = [];

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

morgan.token("body", function (request, response) {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (request, response) => {
  Person.estimatedDocumentCount().then((personCount) => {
    response.send(`
    <p>Phonebook has info for ${personCount} people</p>
    <p>${Date()}</p>
  `);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then((person) => {
    if (person) {
      response.status(200).end();
    } else {
      response.status(404).end();
    }
  })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  if (
    request.body.number === undefined ||
    !(typeof request.body.number === "string") ||
    request.body.number.trim() === ""
  ) {
    response.status(422).send("Number must be defined.").end();
  } else {
    Person.findByIdAndUpdate(
      request.params.id,
      { number: request.body.number },
      { new: true }
    )
      .then((person) => {
        if (person) {
          response.json(person);
        } else {
          response.status(404).end();
        }
      })
      .catch((error) => next(error));
  }
});

app.post("/api/persons", async (request, response, next) => {
  const nameFindQuery = await Person.find({ name: request.body.name });
  const numberFindQuery = await Person.find({ number: request.body.number });

  if (nameFindQuery[0]?.name) {
    response.status(400).send("Name must be unique.").end();
  } else if (numberFindQuery[0]?.number) {
    response.status(400).send("Number must be unique.").end();
  } else {
    const person = new Person({
      name: request.body.name,
      number: request.body.number,
    });
    person.save().then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: 'Malformatted id' });
  }
  if (error.name === "SyntaxError") {
    return response.status(400).send({ error: 'Invalid data format' });
  }
  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);
