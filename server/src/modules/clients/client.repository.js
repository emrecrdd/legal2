import { Client } from '../../models/Client.js';
import { Op } from 'sequelize';

export const clientRepository = {
  create: (data) => Client.create(data),

  findAll: ({ where, ...options }) => Client.findAll({ where, ...options }),

  findAndCountAll: (options) => Client.findAndCountAll(options),

  findById: (id, options = {}) => Client.findByPk(id, options),

  update: (id, data) => Client.update(data, { where: { id } }),

  delete: (id) => Client.destroy({ where: { id } }),

  count: (where = {}) => Client.count({ where }),

  findByEmail: (email) => Client.findOne({ where: { email } }),

  findByTC: (tcNumber) => Client.findOne({ where: { tc_number: tcNumber } }),

  search: (query) => {
    return Client.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${query}%` } },
          { last_name: { [Op.iLike]: `%${query}%` } },
          { company_name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  },
};