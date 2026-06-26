import express from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// Sadece admin kullanıcıları görebilir (veya kendi profilini)
router.get('/', authorize(ROLES.ADMIN), userController.findAll);
router.get('/:id', userController.findOne);

export { router as userRoutes };