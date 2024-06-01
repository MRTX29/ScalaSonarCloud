import { Sequelize } from 'sequelize';

const db = new Sequelize('WebShop', 'TestUser', '123456', {
    host: '192.168.56.1',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: true,
        }
    }
} );

export default db;