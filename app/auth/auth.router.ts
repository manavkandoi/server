// Look at the other router files and figure out how to implement the auth router
// Until you do, you will not be able to login or register or even make requests to those routes
import express from 'express';
import { authToken } from '../middleware/authToken.ts';
import * as eventController from './auth.controller.ts';

const router = express.Router();
//router.use(authToken);
router.post('/signup', eventController.signup);
router.post('/login', eventController.login);
export default router;