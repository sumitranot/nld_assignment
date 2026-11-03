'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      stock_qty: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
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

    // Unique index on SKU
    await queryInterface.addIndex('products', ['sku'], {
      unique: true,
      name: 'idx_products_sku',
    });

    // Index on product name for ILIKE search performance
    await queryInterface.addIndex('products', ['name'], {
      name: 'idx_products_name',
    });

    // DB-level safety net: stock can never go negative
    await queryInterface.addConstraint('products', {
      fields: ['stock_qty'],
      type: 'check',
      name: 'check_products_stock_qty_non_negative',
      where: {
        stock_qty: {
          [Sequelize.Op.gte]: 0,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('products', 'check_products_stock_qty_non_negative');
    await queryInterface.dropTable('products');
  },
};

