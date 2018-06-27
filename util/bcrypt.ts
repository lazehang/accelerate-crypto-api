//bcrypt.js

const bcrypt = require('bcrypt');

module.exports.hashPassword = (plainTextPassword: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                reject(err);
            }

            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

module.exports.checkPassword = (plainTextPassword: string, hashedPassword: string) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, hashedPassword, (err, match) => {
            if (err) {
                reject(err);
            }

            resolve(match);
        });
    });
};