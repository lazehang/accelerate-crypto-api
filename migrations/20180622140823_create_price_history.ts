import * as Knex from "knex";

exports.up = function (knex: Knex) {
    return knex.schema.createTable('coin_history', (table) => {
        table.increments();
        table.integer("coin_id");
        table.string("prices");
        table.timestamps(false, true);
    });
};

exports.down = function (knex: Knex) {
    return knex.schema.dropTable('coin_history');
};
