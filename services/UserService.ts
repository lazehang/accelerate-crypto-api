import * as Knex from 'knex';
import { resolve } from 'path';

const bcrypt = require('../util/bcrypt');
/**
 * User Service
 * -------------------------
 * Do Database Operations
 */
export default class UserService {
    private knex: Knex;

    constructor(knex: Knex) {
        this.knex = knex
    }

    list() {
        return this.knex('users').select();
    }

    findByUsername(username: string) {
        return this.knex('users').first().where("username", "=", username);
    }

    async register(username: string, name: string, password: string, isAdmin: boolean) {
        return new Promise( (resolve, reject) => {
            this.knex('users').where({ username: username }).first()
                .then((user) => {
                    if (user) {
                        reject({message: 'Username already taken' });
                    } else {
                        bcrypt.hashPassword(password)
                            .then(hash => {
                                const newUser = {
                                    username: username,
                                    password: hash,
                                    name: name,
                                    isAdmin: isAdmin
                                };

                                this.knex('users').returning('id').insert(newUser).then((id) => {
                                    const newUserId = parseInt(id);
                                    this.knex('accounts').insert({
                                        user_id: newUserId
                                    })
                                    .then(() => {
                                    this.knex('users').where({ username: newUser.username }).first().then((user) => {
                                        resolve( {
                                            id: user.id,
                                            username: user.username,
                                            name: user.name
                                        });
                                    })
                                });
                                })
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch((err) => {
                    console.log(err.message);
                });
            });
    }
}