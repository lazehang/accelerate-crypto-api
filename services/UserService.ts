import * as Knex from 'knex';
import { resolve } from 'path';
import CoinService from './CoinService';
import { RedisClient } from 'redis';

const bcrypt = require('../util/bcrypt');
/**
 * User Service
 * -------------------------
 * Do Database Operations
 */
export default class UserService {
    private knex: Knex;
    private coinService: CoinService;

    constructor(knex: Knex, coinService: CoinService) {
        this.knex = knex;
        this.coinService = coinService;
    }

    list() {
        return this.knex('users').select();
    }

    findByUsername(username: string) {
        return this.knex('users').first().where("username", "=", username);
    }

    findById(id: number) {
        return this.knex('users').first().where("id", "=", id);
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

    getUserCoins(user_id: number) {
        return new Promise((resolve, reject) => {
             this.knex('user_cryptos')
        .select('*')
        .where({
            user_id: user_id
        }).then((rows) => {
            
            if(rows.length !== 0 ) {
                
                this.coinService.getAll().then((data) => {
                    let userCryptos= [];
                    
                    rows.forEach((row) => {
                        Object.keys(data).forEach((k, v) => {
                            if (k == row.crypto_id) {  
                                data[row.crypto_id].quantity = row.quantity;
                                userCryptos.push(data[row.crypto_id])
                            }
                        })
                        
                        
                    })          
                    resolve(userCryptos);
                })    
            } else {
                resolve(null);
            }
        }).catch((err) => reject(err));
    })
    }
}