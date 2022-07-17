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
  if (!user || !username) {
    return response
      .status(400)
      .json({ error: "User and username are required" });
  }

  if (users.some((user) => user.username === username)) {
    return response.status(400).json({ error: "User already exists" });
  }
  users.push({ id: uuid(), user, username, todos: [] });
  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.json(todos).send();
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
    deadline: new Date(deadline),
    done: false,
    create_at: new Date(),
  };
  user.todos.push(todo);

  return response.json(todo).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  if (!title || !deadline) {
    return response
      .status(400)
      .json({ error: "Title and deadline are required" });
  }
  const todo = user.todos.find((todo) => todo.id === id);
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  todo.done = !todo.done;

  return response.json(todo).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find((todo) => todo.id === id);
  user.todos.splice(user.todos.indexOf(todo), 1);
});

module.exports = app;
