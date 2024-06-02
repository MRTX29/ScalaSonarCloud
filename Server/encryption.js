const crypto = require('crypto');

function encryptData(password, data) {
    let key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);

    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv("AES-256-GCM", key, iv);

    let buffer = Buffer.from(data, 'utf8');
    let encrypted = Buffer.concat([cipher.update(buffer), cipher.final(), iv]);

    return encrypted.toString('base64');
}

function decryptData(password, data) {
    let key = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);

    let encryptedDataWithIv = Buffer.from(data, 'base64');

    let extractedIv = encryptedDataWithIv.slice(-16);
    let encryptedData = encryptedDataWithIv.slice(0, -16);

    let decipher = crypto.createDecipheriv('aes-256-cbc', key, extractedIv);
    let decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    
    return decrypted.toString('utf8');
}

let someText = 'test test test';
let somePassword = 'justapassword123!!';
let encrypted = encryptData(somePassword, someText);

console.log(encrypted);

let decrypted = decryptData(somePassword, encrypted);

console.log(decrypted);