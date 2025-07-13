import express from 'express';
import {
  getDepartmentsDropdown,
  getEmployeesByDepartment,
  createSalary
} from '../controllers/salaryController.js';

const router = express.Router();

router.get('/dropdown/departments', getDepartmentsDropdown);
router.get('/dropdown/employees', getEmployeesByDepartment);
router.post('/', createSalary);

export default router;
