import axios, { AxiosResponse } from 'axios';
import Knex from 'knex';
import { config } from 'dotenv';
import { RedisClient } from 'redis';
import { resolve } from 'path';
const bcrypt = require('../util/bcrypt');
const soldOut = [
    {coin_id: 1},
    {coin_id: 109}
];
/**
 * Coin Service
 * -------------------------
 * Do Coin Operations
 */
export default class CoinService {
    private redisClient: RedisClient;
    private knex: Knex;

    constructor(redisClient: RedisClient, knex: Knex) {
        this.redisClient = redisClient;
        this.knex = knex;
    }
  
    getAll() {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.COINBASE_API_SERVER}ticker/?convert=HKD`)
            .then((resp) => {
                Object.keys(resp.data["data"]).forEach((key, val) => {
                    const coinId = parseInt(key);
                    
                        this.redisClient.set("backup_coins", JSON.stringify(resp.data["data"]));
      
                        this.redisClient.get("backup_coins" , (err, data) => {
                            if (err) {
                                reject(err)                        
                            } else {
                                resolve(JSON.parse(data));
                            }
                        })                                               
                })

                
            }).catch(err => {
                this.redisClient.get("backup_coins" , (err, data) => {
                    if (err) {
                        reject(err)                        
                    } else {
                        resolve(JSON.parse(data));
                    }
                })
            });
        });
    }

    storeHistory(coinId: number, price: string) {
        this.knex('coin_history').select('*').where('coin_id', '=', coinId).then((row) => {
            let prices;
            if (row.length > 0) {
                const last_updated = row[0].updated_at;
            
                const converted_last_updated = new Date(last_updated).getTime();
                const today = Date.now();

                if ((today - last_updated) < 86400) {
                    prices = row[0].prices.split(",");
                        console.log(prices.length);
                        if (prices.length >= 5) {
                            prices.shift();
                            prices.push(price);
                        } else {
                            prices.push(price)
                        }
                        prices =prices.join(",");

                        return this.knex('coin_history').where({
                            coin_id: coinId
                        }).update({
                            prices: prices
                        })
                }

                return null;  
                
            } else {
                return this.knex('coin_history').insert({
                    coin_id: coinId,
                    prices: price
                })
            }
            
        })
    }

    getById(id: number) {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.COINBASE_API_SERVER}ticker/${id}/?convert=HKD`)
            .then((resp) => {
                resolve(resp.data["data"]);
            }).catch(err => reject(err));
        })
    }
    
    getAllPrice() {
        return new Promise((resolve, reject) => {
            this.getAll().then((data) => {
                let quotes = [];
                Object.keys(data).forEach((key, value)=>{
                    var object = {};
                    var i = key;
                    object[key] = data[key]["quotes"];
                    quotes.push(object)
                });
                resolve(quotes);
            }).catch((err) => reject(err.message))
        })
    }

    getPriceById(coinId: number) {
        return this.getAllPrice().then((quotes) => {
            var quote = {};
            Object.keys(quotes).forEach((k, v) => {
                if (typeof quotes[v][coinId] !== 'undefined') {
                    quote['prices'] = quotes[v][coinId];
                }
            });
            return quote;                   
        }).catch((err) => console.log(err.message));
    }

    storeCoinPrice(coinId, userId) {
        return this.getPriceById(coinId).then((prices) => {
            console.log(coinId, userId);
            const key = coinId.toString()+"_"+userId.toString();
            const price = JSON.stringify(prices['prices']["HKD"]["price"]);
            console.log(key);           
            this.redisClient.set(key, price);
        }).catch((err) => console.log(err.message));
    }

    convert(amount: number, coinId: number, userId: number) {
        return new Promise((resolve, reject) => {
            this.storeCoinPrice(coinId, userId).then((resp) => {
            const key = coinId.toString()+"_"+userId.toString();
            
            this.redisClient.get(key, (err, data) => {
                if (err) {
                    reject(err);
                }
                let rate = parseFloat(data)
                if (rate < 0) {
                    rate = Math.round(rate * 100) / 100
                }
                console.log("RATE : "+rate);
                const coinDetail = {
                    coinQuantity: amount/rate,
                    price: rate
                }
                console.log(coinDetail);
                resolve(coinDetail);
            });
      
        }).catch((err) => reject(err))  
    });    
    }

    add(coin_id, quantity, userId) {
        this.knex('user_cryptos')
        .select('*')
        .where({
            crypto_id: coin_id,
            user_id: userId
        }).then((row) => {
            console.log(row);
            if (row === undefined || row.length == 0) {
                return this.knex('user_cryptos').insert({
                    user_id: userId,
                    crypto_id: coin_id,
                    quantity: quantity
                });
            } else {
                console.log("increasing");
                return this.knex.raw('UPDATE user_cryptos SET quantity = quantity + :quantity WHERE user_id = :user_id AND crypto_id = :coin_id', {
                    quantity: quantity,
                    user_id: userId,
                    coin_id: coin_id
                }).catch(function(err){
                    throw err;
                });
            }
        }).catch(err => console.log(err.message))
    }

    deduct(coin_id, quantity, userId) {
        this.knex('user_cryptos')
        .select('*')
        .where({
            crypto_id: coin_id,
            user_id: userId
        }).then((row) => {
            console.log(row);
            if (row === undefined || row.length == 0 || row[0].quantity < quantity) {
                return {
                    error: "Insufficient Coins"
                }
            } else {
                console.log("deducting");
                return this.knex.raw('UPDATE user_cryptos SET quantity = quantity - :quantity WHERE user_id = :user_id AND crypto_id = :coin_id', {
                    quantity: parseInt(quantity),
                    user_id: userId,
                    coin_id: parseInt(coin_id)
                }).catch(function(err){
                    throw err;
                });   
            }
        }).catch(err => console.log(err.message))
    }
}