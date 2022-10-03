const router = require("express").Router();
const userController = require("../controllers/userController");
const todoController = require("../controllers/todoController");

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route("/:userId/todos")
  .get(todoController.getUserTodos)
  .post(todoController.createNewTodo)
  .patch(todoController.updateTodo)
  .delete(todoController.deleteTodo);

module.exports = router;
