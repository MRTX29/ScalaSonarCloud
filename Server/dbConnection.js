const mysql = require('mysql2');
const Client = require('ssh2').Client;
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');

const sshClient = new Client();

let storage = multer({
  storage: diskStorage,
  limits: {
     fileSize: 8000000
  }
});

let diskUpload = multer({
  storage: diskStorage,
  limits: {
     fileSize: 8000000
  }
});

const dbServer = {
    host: '127.0.0.1',
    port: 1337,
    user: 'eye',  
    password: process.env.MYSQL_PASSWORD,
    database: 'paidb'
}

const sshTunnelConfig = {
    host: process.env.IP_ADDRESS,
    port: 7895,
    username: 'eye',
    password: process.env.SSH,
}

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 1337,
    dstHost: '127.0.0.1',
    dstPort: 3306
};

const connectionSSHdb = new Promise((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        forwardConfig.dstHost,
        forwardConfig.dstPort,
        (err, stream) => {
            if (err) reject(err);
            const updatedDbServer = {
                ...dbServer,
                stream
            };
            const connection = mysql.createConnection(updatedDbServer);

            connection.connect(err => {
                if (err) {
                    console.log('* - - -  - - - *');
                    console.log(err);
                    console.log('* - DB ERROR - *');
                    reject(err);
                } else {
                    console.log('Database connected successfully');
                    resolve(connection);
                }
            });
        });
    }).connect(sshTunnelConfig);
});


function getDBrecord(table, column, data) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `SELECT * FROM ${conn.escape(table).slice(1,-1)} WHERE ${conn.escape(column).slice(1,-1)} = ${conn.escape(data)};`;

            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result));
        });
    });
}

function updateDBsession(secret, session_expire, name) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `UPDATE users SET secret = ${conn.escape(secret)}, session_expire = ${conn.escape(session_expire)} WHERE user_name = ${conn.escape(name)};`;

            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(session_expire)); 
        });
    });
}

function removeDBsession(name) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `UPDATE users SET secret = 0, session_expire = '0' WHERE user_name = ${conn.escape(name)};`;

            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result)); 
        });
    });
}

function renewDBsession(name, expireTime) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `UPDATE users SET session_expire = ${conn.escape(expireTime)} WHERE user_name = ${conn.escape(name)};`;

            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result)); 
        });
    });
}

function addUserDB(name, password) {
    return new Promise((resolve, reject) => {
        if (containsOnlyLetters(name) && containsSafeChars(password)) {
            connectionSSHdb.then(conn => {
                const queryBody = `INSERT INTO users VALUES (${conn.escape(name)}, ${conn.escape(bcrypt.hashSync(password, 10))}, 0, 0)`;

                conn.query(queryBody, err => err ? reject(err) : resolve(true));
            });
        } else {
            resolve(false);
        }
    });
}

function getUsersDB() {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `SELECT user_name FROM users;`;
            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result));
        });
    });
}

function getFilesDB() {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `SELECT * FROM files;`;
            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result));
        }).catch(err => reject(err));
    });
}

function removeDBfile(name) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `DELETE FROM files WHERE name = ${conn.escape(name)};`;
            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result));
        });
    });
}

function addDBdata(path, name, displayName, file, link, creationTime, expireTime) {
    return new Promise((resolve, reject) => {
        connectionSSHdb.then(conn => {
            const queryBody = `INSERT INTO files VALUES (${conn.escape(path)}, ${conn.escape(name)}, ${conn.escape(displayName)}, 
                                                   ${conn.escape(file)}, '${conn.escape(link)}', '${creationTime}', '${expireTime}');`;

            conn.query(queryBody, (err, result) => err ? reject(err) : resolve(result));
        });
    });
}

function containsOnlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

function containsSafeChars(str) {
    return /^[a-zA-Z0-9!@#$]+$/.test(str);
}

module.exports = {
    getDBrecord,
    updateDBsession,
    removeDBsession,
    renewDBsession,
    addUserDB,
    getUsersDB,
    getFilesDB,
    removeDBfile,
    addDBdata,
    connectionSSHdb
};