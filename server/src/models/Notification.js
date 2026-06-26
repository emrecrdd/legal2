import { Sequelize,DataTypes } from 'sequelize';

class Notification extends Sequelize.Model {
  static initModel(sequelize) {
    Notification.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('task', 'case', 'event', 'system'),
          defaultValue: 'system',
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        link: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
      },
      {
        sequelize,
        tableName: 'notifications',
      }
    );
  }
}

export { Notification };