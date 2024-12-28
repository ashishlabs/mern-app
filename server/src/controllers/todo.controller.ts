import { Request, Response } from "express";
import Todo, { ITodo } from "../models/todo.model";
import { sendResponse } from "../utils/response";
import logger from "../utils/logger";
import { messages } from "../config/message";
import { statusCodes } from "../config/status.code";

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  const { title, description, userId, status } = req.body;

  try {
    const newTodo = new Todo({
      title,
      description,
      userId,
      status,
    });

    await newTodo.save();

    sendResponse(res, statusCodes.CREATED, messages.TODO_CREATED, newTodo);
  } catch (error) {
    logger.error("Error creating todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const readTodos = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query;

  try {
    const todos = await Todo.find({ userId });

    sendResponse(res, statusCodes.OK, messages.TODOS_FETCHED, todos);
  } catch (error) {
    logger.error("Error fetching todos: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description, status },
      { new: true }
    );

    if (!updatedTodo) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TODO_NOT_FOUND);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.TODO_UPDATED, updatedTodo);
  } catch (error) {
    logger.error("Error updating todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TODO_NOT_FOUND);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.TODO_DELETED, deletedTodo);
  } catch (error) {
    logger.error("Error deleting todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const updateTodoStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "in-progress", "completed"].includes(status)) {
    sendResponse(res, statusCodes.BAD_REQUEST, "Invalid status value");
    return;
  }

  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTodo) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TODO_NOT_FOUND);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.TODO_STATUS_UPDATED, updatedTodo);
  } catch (error) {
    logger.error("Error updating todo status: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const getTodoById = async (req: Request, res: Response): Promise<void> => {
  const { id, userId } = req.params;

  if (!userId) {
    sendResponse(res, statusCodes.BAD_REQUEST, "User ID is required");
    return;
  }

  try {
    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TODO_NOT_FOUND);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.TODO_FETCHED, todo);
  } catch (error) {
    logger.error("Error fetching todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};