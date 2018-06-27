import * as express from 'express';

import AuthRouter   from './AuthRouter';
import UserRouter   from './UserRouter';
import CoinRouter from './CoinRouter';
import TransactionRouter from './TransactionRouter';
import UserService  from '../services/UserService';
import CoinService from '../services/CoinService';
import AccountService from '../services/AccountService';

/**
 * API Routes
 * -------------------------
 * Handle requests from /api
 */
export default class ApiRouter{
    private jwtAuth;
    private userService: UserService;
    private coinService: CoinService;
    private accountService: AccountService;

    constructor(jwtAuth: any, userService: UserService, coinService: CoinService, accountService: AccountService) {
        this.jwtAuth     = jwtAuth;
        this.userService = userService;
        this.coinService = coinService;
        this.accountService = accountService;
    }

    getRouter() {
        const router = express.Router();
        const authRouter  = new AuthRouter(this.userService);
        const userRouter  = new UserRouter(this.userService, this.accountService);
        const coinRouter = new CoinRouter(this.coinService);
        const transactionRouter = new TransactionRouter(this.accountService, this.coinService);
        

        router.use("/auth", authRouter.getRouter());
        router.use("/users", this.jwtAuth.authenticate(), userRouter.getRouter());
        router.use("/coins", coinRouter.getRouter());
        router.use("/transact", this.jwtAuth.authenticate(), transactionRouter.getRouter());                        
        return router;
    }
}


