import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const userController = {
  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const where = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const query = paginate({ where }, page, limit);
      const { count, rows } = await User.findAndCountAll({
        ...query,
        attributes: { exclude: ['password', 'refresh_token'] },
        order: [['created_at', 'DESC']],
      });

      const pagination = getPaginationData(count, page, limit);
      return paginatedResponse(res, rows, pagination, 'Users fetched successfully');
    } catch (error) {
      console.error('❌ User findAll error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password', 'refresh_token'] },
      });
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      return successResponse(res, user, 'User fetched successfully');
    } catch (error) {
      console.error('❌ User findOne error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};