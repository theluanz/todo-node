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

  if (!user) {
    return response.status(404).json({ error: "User does not exists" });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;
  if (!name || !username) {
    return response
      .status(400)
      .json({ error: "User and username are required" });
  }

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists" });
  }
  const newUser = {
    id: uuid(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  return response.json(newUser).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos).send();
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  if (!title || !deadline) {
    return response
      .status(400)
      .json({ error: "Title and deadline are required" });
  }
  const todo = {
    id: uuid(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  todo.done = true;

  return response.json(todo).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).send();
});

module.exports = app;
