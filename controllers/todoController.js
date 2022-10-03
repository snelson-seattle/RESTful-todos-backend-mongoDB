const { User, Todo } = require("../models");
const asyncHandler = require("express-async-handler");

const getUserTodos = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const todos = await Todo.find({ userId });

  if (!todos?.length) {
    return res.status(404).json({ message: "No todos were found." });
  }
  res.json(todos);
});

const createNewTodo = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { todo } = req.body;

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  const newTodo = await Todo.create({ todo, userId });
  if (newTodo) {
    res.status(201).json({ message: "New todo created successfully." });
  } else {
    res.status(400).json({ message: "Invalid todo data received." });
  }
});

const updateTodo = asyncHandler(async (req, res) => {
  const { id, todo, isCompleted } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "An id is required for this operation." });
  }

  const existingTodo = await Todo.findById(id).exec();

  if (!existingTodo) {
    return res.status(400).json({ message: "Todo not found." });
  }

  if (todo) {
    existingTodo.todo = todo;
  }

  if (isCompleted) {
    existingTodo.isCompleted = isCompleted;
  }

  const updatedTodo = await existingTodo.save();

  res.json({ message: "The todo was successfully updated." });
});

const deleteTodo = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "An id is required for this operation." });
  }

  const todo = await Todo.findById(id).exec();

  if(!todo) {
    return res.status(400).json({message: "Todo not found."});
  }

  const result = await todo.deleteOne();

  const reply = `Todo: ${result.todo} with ID ${result._id} successfully deleted.`;

  res.json(reply);
});

module.exports = { getUserTodos, createNewTodo, updateTodo, deleteTodo };
