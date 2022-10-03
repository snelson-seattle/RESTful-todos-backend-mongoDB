const { User, Todo } = require("../models");
const asyncHandler = require("express-async-handler");

const getAllUsers = asyncHandler(async (req, res) => {
  // The .lean() will return json data rather than a full blown mongo document
  // that has methods attached to it
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Make sure all required fields are present
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check for duplicate username
  const duplicateUser = await User.findOne({ username }).lean().exec();

  if (duplicateUser) {
    return res
      .status(409)
      .json({ message: "The username provided is already in use." });
  }

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email }).lean().exec();

  if (duplicateEmail) {
    return res
      .status(409)
      .json({ message: "The email provided is already in use." });
  }

  // Create and store new user
  const newUser = await User.create({ username, email, password });

  if (newUser) {
    res
      .status(201)
      .json({ message: `New user ${username} was created successfully.` });
  } else {
    res.status(400).json({ message: "Invalid user data received." });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, email, password } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "An id is required for this operation." });
  }

  // Find the user in the database
  const user = await User.findById(id).exec();

  // If user is not found, return error
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // If a user record is found, and a new username field has been provided, make sure
  // there is not an existing user with that username
  if (username) {
    const duplicateUsername = await User.findOne({ username }).lean().exec();
    if (duplicateUsername) {
      return res
        .status(409)
        .json({ message: "The username provided is already in use." });
    }
    user.username = username;
  }

  // If a user record is found, and a new email field has been provided, make sure
  // there is not an existing user with that email address
  if (email) {
    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res
        .status(409)
        .json({ message: "The email provided is already in use." });
    }
    user.email = email;
  }

  if (password) {
    // We don't need to hash the password because it is being done by our mongoose model pre-save
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({ message: `The user ${updatedUser.username} was updated successfully.` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "An id is required for this operation." });
  }

  const todos = await Todo.findOne({ user: id }).lean().exec();

  if (todos?.length) {
    return res.status(400).json({ message: "User has todos." });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} successfully deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
