import { Router } from "express";
import { addTag, getTags } from "../../controllers/tag/tag.controller";

const router = Router();

//Add Tags
router.post("/", addTag);

//Get Tags
router.get("/", getTags); 


export default router;