let env = process.env.NODE_ENV;
require('dotenv').config();
const config = {
    dev: {
        db : {
            host: 'localhost',
            port: 3306,
            name: 'mydb',
            user: process.env.DB_USER_LOCAL,
            pass: process.env.DB_PASSWORD_LOCAL
        }
    },
    prod: {
        db: {
            host: process.env.DB_HOST_PROD,
            port: process.env.DB_PORT_PROD,
            pass: process.env.DB_PASSWORD_PROD,
            user: process.env.DB_USER_PROD,
            name: process.env.DB_NAME_PROD
        }
    }
}
module.exports = config[env];    