let moment = require('moment');
let Ajv = require('ajv');
let fs = require('fs');
let session = require('../../session');
let db = require('../../dbConnection');
let session = require('../../session');
const { error } = require('ajv/dist/vocabularies/applicator/dependencies');


const getIndex = ((req, res) => {
    res.locals.title = 'FroginaFog';
    res.render('index');
})

const getFavicon = ((req, res) => {
    res.sendFile(__dirname + 'public/' + 'favicon.ico')
})

const getLogin = ((req, res) => {
    session.verifySessionAndToken(req)
    .then(result => {
        if (result) {
            res.redirect('/');
        } else {
            res.locals.title = 'Login';
            res.render('login');
        }
    })
    .catch(error => console.error(error));

});

const postLogin = ((req, res) => {
    let [username, password] = ['123', '123'];
    if (properReq(req) && containsOnlyLetters(req.body.username) && containsSafeChars(req.body.password)) {
        [username, password] = [req.body.username, req.body.password];
    }

    session.validateLogin(username, password)
    .then(({signedToken, expireTime}) => {
        if (signedToken != expireTime) {
            res.cookie('session', signedToken, {
                secure: true,
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                expires: expireTime
            });
            res.json({ redirectUrl: '/' });
        } else {
            res.json({});
        }
    })
    .catch((error) => {
        console.error(error);
        res.json({});
    });
});

const getRegister = ((req, res) => {
    session.verifySessionAndToken(req)
    .then(result => {
        if (result) {
            res.redirect('/user');
        } else {
            res.locals.title = 'Register';
            res.render('register');
        }
    })
    .catch(error => console.error(error));
});

const postRegister = ((req, res) => {
    if (properReq(req) && containsOnlyLetters(req.body.username) && containsSafeChars(req.body.password)) {
        db.addUserDB(req.body.username, req.body.password)
        .then(result => result ? (console.log('User registered')) : console.log('User couldnt be registered'))
        .catch(error => console.error(error));
        res.json({ redirectUrl: '/' });
    } else {
        res.json({});
    }
});

const getLogout = ((req, res) => {
    session.verifySessionAndToken(req)
    .then(result => {
        if (result) {
            session.decodePayload(req.cookies['session'])
            .then(decoded => db.updateDBsession(0, 0, decoded['name']))
            .catch(error => console.error(error));
        }

        res.redirect('/login');
    })
    .catch(error => console.error(error));
});

const postUpload = ((req, res) => {
    session.verifySessionAndToken(req)
    .then(result => result ? session.decodePayload(req) : res.json({}))
    .then(decoded => {
        let expireTime = new Date();
        let maxDaysValid = 30
        expireTime.setTime(expireTime.getTime() + Math.min(req.body.daysvalid, maxDaysValid) * 86400000);

        if(xor(req.body.link, req.body.file)) {
            db.addDBdata(req.body.path, decoded['name'], req.body.displayname, req.body.file || 'NULL', req.body.link || 'NULL', new Date(), expireTime);

            res.json({ redirectUrl: '/' });
        } else {
            res.json({});
        }
    })
    .catch(error => console.error(error));
});

const getFiles = (req, res) => {
    db.getFilesDB()
    .then(files => {
        res.json(files);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Database query error' });
    });
};

const deleteFile = (req, res) => {
    const fileName = req.params.name;
    db.removeDBfile(fileName)
    .then(result => res.json({ success: true, result }))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Database query error' });
    });
}

function xor(a, b) {
    return (a || b) && !(a && b);
}

function containsOnlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

function containsSafeChars(str) {
    return /^[a-zA-Z0-9!@#$]+$/.test(str);
}

function properReq(request) {
    try {
        const ajv = new Ajv();
        const expectedSchema = {
        type: 'object',
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }
        },
        required: ['username', 'password'],
        additionalProperties: false
        };

        const contentHeader = request.headers['content-type'];
        const requiredHeader = 'application/json;charset=UTF-8';

        if (contentHeader !== requiredHeader || !ajv.validate(expectedSchema, request.body)) return false;
    } catch (e) {
        console.log(e);
        return false;
    }
  
    return true;
}

function logOptional(str) {
    const logFilePath = __dirname + '/../../logs/optional.log';
    const date = moment().tz('Europe/Paris').format('HH:mm:ss.SSS YYYY:MM:DD');

    fs.appendFile(logFilePath, date + str + '\n', function (err) {
        if (err) console.log(err);
        console.log(date + str);
    });
}

module.exports = {
    getIndex,
    getFavicon,
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    getLogout,
    postUpload,
    getFiles,
    deleteFile
}