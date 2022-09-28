require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const Person = require("./models/person");

const app = express();
app.use(express.static("build"));
app.use(express.json());

morgan.token("body", (req) => {
  return req.body;
});
app.use(assignBody);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [];

app.get("/", (request, response) => {
  response.send("<h1>Hello to my Phonebook!</h1>");
});

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  let body = undefined;
  try {
    body = JSON.parse(request.body);
  } catch (err) {
    return response.status(400).json({
      error: "missing content",
    });
  }

  if (!body.name) {
    return response.status(400).json({
      error: " missing name",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "missing number",
    });
  }
  // const duplicatedName = persons.find((p) => p.name === body.name);
  // if (duplicatedName) {
  //   return response.status(400).json({
  //     error: "name must be unique",
  //   });
  // }

  const person = Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((resp) => {
      response.json(person);
    })
    .catch((err) => console.log(err));
});

function assignBody(req, res, next) {
  req.body = JSON.stringify(req.body);
  next();
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
