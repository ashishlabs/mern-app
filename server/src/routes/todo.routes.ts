import { Router } from "express";
import { createTodo, readTodos, updateTodo, deleteTodo, updateTodoStatus, getTodoById } from "../controllers/todo.controller";

const router = Router();

// Create Todo
router.post("/", createTodo);

// Read Todos
router.get("/", readTodos);

// Read single Todo
router.get("/:userId/:id", getTodoById);

// Update Todo
router.put("/:id", updateTodo);

// Update Todo Status
router.patch("/:id/status", updateTodoStatus);

// Delete Todo
router.delete("/:id", deleteTodo);

export default router;