exports.up = function(knex, Promise) {
    return knex.schema.createTable('accounts', (table) => {
        table.increments();
        table.integer("user_id").unsigned();
        table.integer("amount");
        table.timestamps(false, true);

        table.foreign('user_id').references('users.id');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('accounts');
};