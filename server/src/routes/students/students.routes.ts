import { Router } from "express";
import { getStudents, saveStudent } from "../../controllers/students/student.controller";

const router = Router();

//Add Tags
router.post("/", saveStudent);

//Get Tags
router.get("/", getStudents); 


export default router;