import { Request, Response } from "express";
import Todo, { ITodo } from "../../models/todo/todo.model";
import Tag from "../../models/tag/tag.model";
import { sendResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { messages } from "../../config/message";
import { statusCodes } from "../../config/status.code";
import { getUserIdFromToken } from "../../utils/auth";

export const createTodo = async (req: Request, res: Response, next: Function): Promise<void> => {
  const { title, description, status, priority, tags, dueDate } = req.body;

  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    const newTodo = new Todo({
      title,
      description,
      userId,
      status,
      priority,
      tags,
      createdDate: new Date(),
      dueDate,
    });

    await newTodo.save();

    sendResponse(res, statusCodes.CREATED, messages.TODO_CREATED, newTodo);
  } catch (error) {
    logger.error("Error creating todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    next(error);
  }
};

export const readTodos = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  const { status, sortBy, page = 1, limit = 10 } = req.query;

  if (!userId) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
    return;
  }

  try {
    const query: any = { userId };

    if (status) {
      query.status = status;
    }

    let sortOptions: any = {};
    if (sortBy) {
      switch (sortBy) {
        case "dueDate":
          sortOptions.dueDate = 1; // Ascending order
          break;
        case "priority":
          sortOptions.priority = 1; // Ascending order
          break;
        case "creationDate":
          sortOptions.createdAt = 1; // Ascending order
          break;
        default:
          break;
      }
    }

    const totalCount = await Todo.countDocuments(query);
    const todos = await Todo.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    sendResponse(res, statusCodes.OK, messages.TODOS_FETCHED, { todos, totalCount });
  } catch (error) {
    logger.error("Error readTodos: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const updateTodo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    dueDate
  } = req.body;

  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      {
        title,
        description,
        userId,
        status,
        priority,
        tags,
        dueDate
      },
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
  const { id } = req.params;
  const userId = getUserIdFromToken(req.headers.authorization);
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
    logger.error("Error getTodoById todo: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};


export const searchTodos = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;
  const userId = getUserIdFromToken(req.headers.authorization);

  if (!userId) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
    return;
  }

  if (!query) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.QUERY_REQUIRED);
    return;
  }

  try {
    const searchQuery: any = { userId };

    searchQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ];

    const todos = await Todo.find(searchQuery);

    if (!todos.length) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TODO_NOT_FOUND, []);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.TODOS_FOUND, todos);
  } catch (error) {
    logger.error("Error searching todos: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

