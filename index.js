require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const Person = require("./models/person");

const app = express();
app.use(express.json());

const assignBody = (req, res, next) => {
  req.body = JSON.stringify(req.body);
  next();
};
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};
morgan.token("body", (req) => {
  return req.body;
});

app.use(express.static("build"));
app.use(assignBody);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (request, response) => {
  Person.count({}).then((count) => {
    response.send(`<p>Phonebook has info for ${count} people</p>
                    <p>${new Date()}</p>`);
  });
});

app.get("/", (request, response) => {
  response.send("<h1>Hello to my Phonebook!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((p) => {
      if (p) {
        response.json(p);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});
app.put("/api/persons/:id", (request, response, next) => {
  const body = JSON.parse(request.body);
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = JSON.parse(request.body);
  const person = Person({
    name: body.name,
    number: body.number,
  });
  console.log(person);

  person
    .save()
    .then((resp) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(errorHandler); // this has to be the last loaded middleware.
