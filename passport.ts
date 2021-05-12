import * as passport from 'passport';
import config from './config';
import { Strategy as LocalStrategy } from 'passport-local';
import UserService from './services/UserService';
import CoinService from './services/CoinService';
import * as redis from 'redis';

const knexConfig = require('./knexfile')[config.env || 'staging'];
const knex = require('knex')(knexConfig);
const bcrypt = require('./util/bcrypt');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

const coinService = new CoinService(client, knex);
const userService = new UserService(knex, coinService);

module.exports = (app) => {

    console.log("passport init");
    app.use(passport.initialize());
    console.log("passport session");
    app.use(passport.session());

    passport.use('local-login', new LocalStrategy(
        (username, password, done) => {
            userService.findByUsername(username)
                .then((user) => {
                    if (user == null) {
                        return done(null, false, { message: 'Incorrect credentials.' });
                    }

                    bcrypt.checkPassword(password, user.password)
                        .then(result => {
                            if (result) {
                                return done(null, {
                                    id: user.id,
                                    username: user.username,
                                    name: user.name
                                });
                            } else {
                                return done(null, false, { message: 'Incorrect credentials' });
                            }
                        })
                })
                .catch((err) => console.log(err.message))
        }));

    passport.use('local-signup', new LocalStrategy({
            passReqToCallback: true
        },
        (req, username, password, done) => {
            console.log(username)
            knex('users').where({ username: username }).first()
                .then((user) => {
                    if (user) {
                        return done(null, false, { message: 'Username already taken' });
                    } else {
                        bcrypt.hashPassword(password)
                            .then(hash => {
                                const newUser = {
                                    username: username,
                                    password: hash,
                                    name: req.body.name
                                };

                                knex('users').insert(newUser).then((newuser) => {
                                    console.log(newuser)
                                    knex('users').where({ username: newUser.username }).first().then((user) => {
                                        done(null, {
                                            id: user.id,
                                            username: user.username,
                                            name: user.name
                                        });
                                    })
                                })
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch((err) => {
                    return done(err);
                });
        }
    ));

    passport.serializeUser((sessionUser, done) => {
        console.log("Serialize : \n", sessionUser);
        done(null, sessionUser);
    });

    passport.deserializeUser((sessionUser, done) => {
        console.log("Deserialize sessionUser : \n", sessionUser, "\n ===");
        done(null, sessionUser);
    });
};