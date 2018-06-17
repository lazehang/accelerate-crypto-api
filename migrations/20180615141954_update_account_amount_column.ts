import * as Knex from "knex";

exports.up = function (knex: Knex){
    return knex.schema.alterTable('accounts', function(t) {
        t.integer('amount').defaultTo(100000).alter();
    });
};

exports.down = function (knex: Knex) {
    return knex.schema.alterTable('accounts', function(t) {
        t.integer('amount').defaultTo(null).alter();
    });
};
