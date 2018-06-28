import * as Knex from "knex";

exports.up = function (knex: Knex){
    return knex.schema.alterTable('transaction', function(t) {
        t.float('rate').alter();
    });
};

exports.down = function (knex: Knex) {
    return knex.schema.alterTable('transaction', function(t) {
        t.integer('rate').alter();
    });
};
