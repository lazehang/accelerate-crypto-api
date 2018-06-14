exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', (table) => {
        table.increments();
        table.string("username").unique;
        table.string("password");
        table.string("name");
        table.boolean("isAdmin").default(false);
        table.string("social_id").nullable();
        table.string("provider").nullable();
        table.timestamps(false, true);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};