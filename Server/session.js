let bcrypt = require('bcryptjs');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let {
    getDBrecord,
    updateDBsession,
    removeDBsession,
    renewDBsession
} = require('./dbConnection');
const { name } = require('pug');
const { error } = require('ajv/dist/vocabularies/applicator/dependencies');

const sessionLength = 15; // in minutes

// ~~~~~~~~~~
function getSecret() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(69, (err, buf) => {
            err ? reject(err) : resolve(buf.toString('base64'));
        });
    });
}

function signToken(payload, secret) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, (err, signed) => {
            tmp_salt = secret;
            err ? reject(err) : resolve({signed, secret})
        });
    });
}

function getToken(payload) {
    return new Promise((resolve, reject) => {
        getSecret()
        .then(secret => signToken(payload, secret))
        .then(({signed, secret}) => resolve({signed, secret}))
        .catch((err) => reject(err));
    });
}

function verifySessionAndToken(req) {
    return new Promise((resolve, reject) => {
        decodePayload(req.cookies['session'])
        .then(decoded => decoded ? getDBrecord('users', 'user_name', decoded['name']) : resolve(false))
        .then(secret => secret.length ? verifyToken(req.cookies['session'], secret[0]['secret']) : resolve(false))
        .then(verified => resolve(verified))
        .catch(err => reject(err));
    });
}

function verifyToken(token, secret) {
    return new Promise((resolve) => {
        jwt.verify(token, secret, (err, verified) => err ? resolve(false) : resolve(verified));
    });
}

function preparePayload(dbRecord) {
    return {
        name: dbRecord[0]['user_name']
    }
}

function decodePayload (token) {
    return new Promise((resolve) => {
        try {
            resolve(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()));
        } catch(err) {
            resolve(false);
        }
    });
}


function validateLogin(username, password) {
    return new Promise((resolve, reject) => {
        let tmpDBvalue = '';
        let signedToken = '';

        getDBrecord('users', 'user_name', username)
        .then(dbResult => {
            const dummyHash = '$2a$10$eM3t9fLdOLjD5UqAMTHmFeeTNHRm2Qo49M0vVa0hM4O73ZL16M87O';
            const passwordDB = dbResult.length ? dbResult[0]['password'] : dummyHash;
            
            tmpDBvalue = dbResult;

            return bcrypt.compareSync(password, passwordDB);
        })
        .then(bResult => {
            if (bResult) {
                return preparePayload(tmpDBvalue);
            } else {
                resolve(false);
            }
        })
        .then(payload => getToken(payload))
        .then(({signed, secret}) => {
            signedToken = signed;
            updateDBsession(secret, Date.now() + sessionLength * 60000, username)
        })
        .then(expireTime => resolve({signedToken, expireTime}))
        .catch(error => reject(error));
    });
}

function validateSession(req, res, next) {
    verifySessionAndToken(req)
    .then(verified => {
        if (verified) {
            let expireTime = new Date();
            expireTime.setTime(expireTime.getTime() + sessionLength * 60000);

            res.cookie('session', req.cookies['session'], {
                secure: true,
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                expires: expireTime
            });

            renewDBsession(verified['name'], expireTime);
            next();
        } else {
            res.redirect('/login');
        }
    })
    .catch(error => console.error(error));
}

function killSession(req) {
    return new Promise((resolve, reject) => {
        decodePayload(req.cookies['session'])
        .then(payload => payload ? removeDBsession(payload['name']) : resolve(false))
        .then(() => resolve(true))
        .catch(error => reject(error));
    });
}

module.exports = {
    validateLogin,
    verifySessionAndToken,
    validateSession,
    killSession,
    decodePayload
}