'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Index on order_id for efficient item retrieval and aggregation per order
    await queryInterface.addIndex('order_items', ['order_id'], {
      name: 'idx_order_items_order_id',
    });

    // Index on product_id for relational integrity lookups
    await queryInterface.addIndex('order_items', ['product_id'], {
      name: 'idx_order_items_product_id',
    });

    // Quantity must be strictly positive (> 0)
    await queryInterface.addConstraint('order_items', {
      fields: ['quantity'],
      type: 'check',
      name: 'check_order_items_quantity_positive',
      where: {
        quantity: {
          [Sequelize.Op.gt]: 0,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('order_items', 'check_order_items_quantity_positive');
    await queryInterface.dropTable('order_items');
  },
};

