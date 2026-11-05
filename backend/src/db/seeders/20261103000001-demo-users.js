'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const adminHash = bcrypt.hashSync('Admin@123', 12);
    const createHash = bcrypt.hashSync('Create@123', 12);
    const viewHash = bcrypt.hashSync('View@123', 12);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password_hash: adminHash,
        role: 'ADMIN',
        access: null,
        created_at: now,
        updated_at: now,
      },
      {
        email: 'view@example.com',
        password_hash: viewHash,
        role: 'USER',
        access: 'VIEW',
        created_at: now,
        updated_at: now,
      },
      {
        email: 'create@example.com',
        password_hash: createHash,
        role: 'USER',
        access: 'CREATE',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@example.com', 'view@example.com', 'create@example.com'],
    });
  },
};

