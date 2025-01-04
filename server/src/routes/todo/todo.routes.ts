import { Router } from "express";
import { createTodo,
     readTodos, 
     updateTodo, 
     deleteTodo, updateTodoStatus, getTodoById, searchTodos} from "../../controllers/todo.controller";

const router = Router();

// Create Todo
router.post("/", createTodo);

// Read Todos
router.get("/", readTodos);

// Read single Todo
router.get("/:id", getTodoById);

// Update Todo
router.put("/:id", updateTodo);

// Update Todo Status
router.patch("/:id/status", updateTodoStatus);

// Delete Todo
router.delete("/:id", deleteTodo);

//Search Todo
router.get("/search", searchTodos);



export default router;