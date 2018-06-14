import * as Knex from "knex";

exports.seed = (knex: Knex) => {
    return knex("users").del()
        .then(function () {
            return knex("users").insert([
                { name: "Michael", username: "michael", password: "password"},
                { name: "Gordon", username: "gordon", password: "password"},
                { name: "Alex",  username: "alex", password: "password", isAdmin: true}
            ]);
        });
};
