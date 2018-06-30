import * as Knex from "knex";

exports.up = function (knex: Knex){
    return knex.schema.table('transaction', function(t) {
        t.string('type');
    });
};

exports.down = function (knex: Knex){
    return knex.schema.table('transaction', function(t) {
        t.dropColumn('type');
    });
};
