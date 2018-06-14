import axios, { AxiosResponse } from 'axios';
import Knex from 'knex';
import { config } from 'dotenv';
const bcrypt = require('../util/bcrypt');
/**
 * Coin Service
 * -------------------------
 * Do Coin Operations
 */
export default class CoinService {
  
    getAll() {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.COINBASE_API_SERVER}ticker/`)
            .then((resp) => {
                resolve(resp.data);
            }).catch(err => reject(err));
        });
    }

    getById(id: number) {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.COINBASE_API_SERVER}ticker/${id}`)
            .then((resp) => {
                resolve(resp.data);
            }).catch(err => reject(err));
        })
    }
}