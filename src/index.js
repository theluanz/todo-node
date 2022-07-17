const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (user) {
    request.user = user;
    return next();
  }
  return response.status(400).json({ error: "User not found" });
}

app.post("/users", (request, response) => {
  const { user, username } = request.body;
  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists" });
  }
  users.push({ id: uuid(), user, username, todos: [] });
  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
