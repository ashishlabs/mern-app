import { Request, Response } from "express";
import Tag from "../models/tag.model";
import { sendResponse } from "../utils/response";
import logger from "../utils/logger";
import { messages } from "../config/message";
import { statusCodes } from "../config/status.code";
import { getUserIdFromToken } from "../utils/auth";

export const addTag = async (req: Request, res: Response): Promise<void> => {
  const { tag } = req.body;
  const userId = getUserIdFromToken(req.headers.authorization);

  if (!userId) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
    return;
  }

  if (!tag) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.TAG_REQUIRED);
    return;
  }

  try {
    // Check if the tag already exists for the user
    const existingTag = await Tag.findOne({ tag, userId });
    if (existingTag) {
      sendResponse(res, statusCodes.CONFLICT, messages.TAG_ALREADY_EXISTS);
      return;
    }

    const newTag = new Tag({ tag, userId });
    await newTag.save();
    const tags = await Tag.find({ userId });

    sendResponse(res, statusCodes.CREATED, messages.TAG_ADDED, tags);
  } catch (error) {
    logger.error("Error adding tag: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
    return;
  }
  try {
    const tags = await Tag.find({ userId: userId });

    if (!tags.length) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.TAGS_NOT_FOUND, []);
      return;
    }
    sendResponse(res, statusCodes.OK, messages.TAGS_FETCHED, tags);
    return;
  } catch (error) {
    logger.error("Error fetching tags: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED, { error });
  }
};