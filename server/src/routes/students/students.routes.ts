import { Router } from "express";
import { deleteStudent, getStudentById, getStudents, restoreStudent, saveStudent, updateStudent } from "../../controllers/students/student.controller";

const router = Router();
router.post("/", saveStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.post("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.put("/:id", restoreStudent);
export default router;