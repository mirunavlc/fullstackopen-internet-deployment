const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://mirunavlc:${password}@cluster0.tees5g2.mongodb.net/phonebookApp?retryWrites=true&w=majority`;
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);
let people = [];
mongoose
  .connect(url)
  .then((result) => {
    Person.find({}).then((result) => {
      result.forEach((person) => {
        people = people.concat(person);
      });
      if (process.argv.length === 3) {
        console.log("Phonebook:");
        people.forEach((p) => {
          console.log(`${p.name} ${p.number}`);
        });
      }
      return mongoose.connection.close();
    });
  })
  .catch((err) => console.log(err));

if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  mongoose
    .connect(url)
    .then((result) => {
      console.log("connected");

      const person = new Person({
        name: name,
        number: number,
      });

      return person.save();
    })
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook!`);
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}
