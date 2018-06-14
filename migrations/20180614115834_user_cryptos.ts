exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_cryptos', (table) => {
        table.increments();
        table.integer("user_id").unsigned();
        table.integer("crypto_id");
        table.integer("quantity");
        table.timestamps(false, true);

        table.foreign('user_id').references('users.id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('user_cryptos');
};