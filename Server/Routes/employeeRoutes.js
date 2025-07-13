import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,

} from '../controllers/employeeController.js';

const router = express.Router();

router.post('/', createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

export default router;
