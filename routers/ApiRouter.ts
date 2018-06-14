import * as express from 'express';

import AuthRouter   from './AuthRouter';
import UserRouter   from './UserRouter';
import CoinRouter from './CoinRouter';
import UserService  from '../services/UserService';
import CoinService from '../services/CoinService';

/**
 * API Routes
 * -------------------------
 * Handle requests from /api
 */
export default class ApiRouter{
    private jwtAuth;
    private userService: UserService;
    private coinService: CoinService;

    constructor(jwtAuth: any, userService: UserService, coinService: CoinService) {
        this.jwtAuth     = jwtAuth;
        this.userService = userService;
        this.coinService = coinService;
    }

    getRouter() {
        const router = express.Router();
        const authRouter  = new AuthRouter(this.userService);
        const userRouter  = new UserRouter(this.userService);
        const coinRouter = new CoinRouter(this.coinService);

        router.use("/auth", authRouter.getRouter());
        router.use("/users", this.jwtAuth.authenticate(), userRouter.getRouter());
        router.use("/coins", this.jwtAuth.authenticate(), coinRouter.getRouter());        
        return router;
    }
}


