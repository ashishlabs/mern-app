import { Router } from "express";
import { getNotifications, subscribe } from "../controllers/notification.controller";

const router = Router();

router.post("/subscribe", subscribe);
router.get("/", getNotifications);

export default router;