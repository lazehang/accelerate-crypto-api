import * as express     from 'express';
import * as bodyParser  from 'body-parser';
import * as cors        from 'cors';

import * as Knex        from 'knex';

import * as Knexfile    from './knexfile';
import jwtStrategy      from './util/auth/JwtStrategy';
import ApiRouter        from './routers/ApiRouter';
import UserService      from './services/UserService';
import CoinService from './services/CoinService';
import AccountService from './services/AccountService';

import * as redis from 'redis';

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379
});

require('dotenv').config;

const knex = Knex(Knexfile[process.env.ENV]);
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const coinService = new CoinService(redisClient, knex);
const userService = new UserService(knex, coinService);
const jwtAuth = jwtStrategy(userService);
const accountService = new AccountService(knex);
const apiRouter = new ApiRouter(jwtAuth, userService, coinService, accountService);

const passport = require("./passport")(app);
app.set('socketio', io);
app.use(bodyParser());
app.use(cors());
app.use(jwtAuth.initialize());
app.use("/api", apiRouter.getRouter());

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("This is owned by Laze Hang ( Mangal Hang Limbu)");
})

io.on('connection', function(socket){
    console.log("Socket connected: " + socket.id);
        setInterval(() => {
            coinService.getAll().then((data) => { 
                coinService.getCoins().then((coins) => {
                    socket.emit('action', {type: 'SOCKET_UPDATE_COINS', coins: coins})
                });
            }).catch((err) => console.log(err.message))
        }, 40000);     
        
  });
     
http.listen(process.env.PORT,() => {
    console.log(`Application started at port: ${process.env.PORT}`);
});