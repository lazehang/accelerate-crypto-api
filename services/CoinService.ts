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
                    soldOut.forEach((sold) => {
                        if (parseInt(key) === sold.coin_id) {
                            const coinId = parseInt(key);
                            resp.data["data"][coinId].soldOut = true;
                        }
                    })
                resolve(resp.data["data"]);
                    
                })
            }).catch(err => reject(err));
        });
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

    storeCoinPrice(coinId, userID) {
        return this.getPriceById(coinId).then((prices) => {
            const key = coinId.toString()+"_"+userID.toString();
            const price = JSON.stringify(prices['prices']["HKD"]["price"]);
            console.log(key);           
            this.redisClient.set(key, price);
        });
    }

    convert(amount: number, coinId: number, userID: number) {
        this.storeCoinPrice(coinId, userID);

        return new Promise((resolve, reject) => {
            this.redisClient.get(coinId.toString()+"_"+userID.toString(), (err, data) => {
                const coinDetail = {
                    coinQuantity: amount/parseInt(data),
                    price: parseInt(data)
                }
                resolve(coinDetail);
            });
        });
        
        
        // return this.getPriceById(coinId).then((prices) => {
        //     return amount/(prices['prices']['HKD'].price);      
        // }).catch((err) => console.log(err.message));
    }

    add(coin_id, quantity, userId) {
        this.knex('user_cryptos').select('coin_id').where('coin_id', '=', coin_id).then((row) => {
            if (row !== null) {
                this.knex('user_cryptos').increment('quantity', quantity).where('coin_id', '=', coin_id)
            } else {
                this.knex('user_cryptos').insert({
                    user_id: userId,
                    coin_id: coin_id,
                    quantity: quantity
                })
            }
        })
        
    }
}