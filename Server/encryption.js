const crypto = require('crypto');

function encryptData(password, data) {
    var key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);

    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    var buffer = Buffer.from(data, 'utf8');
    var encrypted = Buffer.concat([cipher.update(buffer), cipher.final(), iv]);

    return encrypted.toString('base64');
}

function decryptData(password, data) {
    var key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);

    var encryptedDataWithIv = Buffer.from(data, 'base64');

    var extractedIv = encryptedDataWithIv.slice(-16);
    var encryptedData = encryptedDataWithIv.slice(0, -16);

    var decipher = crypto.createDecipheriv('aes-256-cbc', key, extractedIv);
    var decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    
    return decrypted.toString('utf8');
}

var someText = 'test test test';
var somePassword = 'justapassword123!!';
var encrypted = encryptData(somePassword, someText);

console.log(encrypted);

var decrypted = decryptData(somePassword, encrypted);

console.log(decrypted);