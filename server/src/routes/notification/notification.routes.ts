import { Router } from "express";
import { subscribe, getNotifications } from "../../controllers/notification/notification.controller";

const router = Router();

router.post("/subscribe", subscribe);
router.get("/", getNotifications);

export default router;