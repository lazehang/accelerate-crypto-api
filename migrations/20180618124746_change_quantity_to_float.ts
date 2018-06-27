import * as Knex from "knex";

exports.up = function (knex: Knex){
    return knex.schema.alterTable('user_cryptos', function(t) {
        t.float('quantity').alter();
    });
};

exports.down = function (knex: Knex) {
    return knex.schema.alterTable('user_cryptos', function(t) {
        t.integer('amount').alter();
    });
};
