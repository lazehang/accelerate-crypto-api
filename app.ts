import * as express     from 'express';
import * as bodyParser  from 'body-parser';
import * as cors        from 'cors';

import * as Knex        from 'knex';

import * as Knexfile    from './knexfile';
import jwtStrategy      from './util/auth/JwtStrategy';
import ApiRouter        from './routers/ApiRouter';
import UserService      from './services/UserService';
import CoinService from './services/CoinService';

require('dotenv').config;

const knex = Knex(Knexfile[process.env.ENV]);
const app = express();

const userService = new UserService(knex);
const jwtAuth = jwtStrategy(userService);
const coinService = new CoinService();
const apiRouter = new ApiRouter(jwtAuth, userService, coinService);

const passport = require("./passport")(app);

app.use(bodyParser());
app.use(cors());
app.use(jwtAuth.initialize());
app.use("/api", apiRouter.getRouter());

app.listen(process.env.PORT,() => {
    console.log(`Application started at port: ${process.env.PORT}`);
});