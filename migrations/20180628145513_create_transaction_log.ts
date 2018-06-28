import * as Knex from "knex";

exports.up = function (knex: Knex){
    return knex.schema.createTable('transaction', (table) => {
        table.increments();
        table.integer("user_id");
        table.integer("coin_id");
        table.integer("amount");
        table.integer("rate");
        table.timestamps(false, true);
    });
};

exports.down = function (knex: Knex){
    return knex.schema.dropTable('transaction');
};
