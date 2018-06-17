import * as Knex from 'knex';
import { resolve } from 'path';

const bcrypt = require('../util/bcrypt');
/**
 * Account Service
 * -------------------------
 * Do Account Operations
 */
export default class AccountService {
    private knex: Knex;

    constructor(knex: Knex) {
        this.knex = knex
    }

    getBalance(userId: number) {
        return this.knex('accounts').select('amount').where('user_id', '=', userId);
    }

    isSufficient(user_id: number, buyingAmount: number) {
        this.getBalance(user_id).then((amount) => {
            return amount >= buyingAmount;
        })
    }

    buy(user_id: number, buyingAmount: number) {
        if (this.isSufficient(user_id, buyingAmount)) {
            return this.knex('accounts').decrement('amount', buyingAmount).returning('id');
        }
    }

    sell(user_id: number, sellingAmount: number) {
        return this.knex('accounts').increment('amount', sellingAmount).returning('id');
    }
    
}