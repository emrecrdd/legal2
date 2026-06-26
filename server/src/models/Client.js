import { Sequelize, DataTypes } from 'sequelize';
class Client extends Sequelize.Model {
  static initModel(sequelize) {
    Client.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        company_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        tc_number: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
          validate: {
            len: [11, 11],
          },
        },
        tax_number: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        district: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        postal_code: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        status: {
          type: DataTypes.ENUM('active', 'passive', 'archived'),
          defaultValue: 'active',
        },
        created_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        tableName: 'clients',
      }
    );
  }

  get fullName() {
    return `${this.first_name} ${this.last_name}`;
  }
}

export { Client };