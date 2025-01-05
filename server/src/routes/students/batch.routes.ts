import { Router } from "express";
import { getBatches, saveBatch } from "../../controllers/students/batch.controller";

const router = Router();

//Add Tags
router.post("/", saveBatch);

//Get Tags
router.get("/", getBatches); 


export default router;