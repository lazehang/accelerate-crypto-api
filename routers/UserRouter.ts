import * as express from 'express';
import UserService from '../services/UserService';
import AccountService from '../services/AccountService';

/**
 * User Routes
 * -------------------------
 * Handle requests from /users
 */
export default class UserRouter{
    private userService: UserService;
    private accountService: AccountService;

    constructor(userService: UserService, accountService: AccountService){
        this.userService = userService;
        this.accountService = accountService;
    }

    getRouter(){
        let router = express.Router();
        router.get("/", this.get.bind(this));
        router.get("/user", this.getUser.bind(this));
        router.get("/account", this.getAccount.bind(this));
        router.get("/coins", this.getCoins.bind(this));
        router.get("/log", this.getTransaction.bind(this));
        router.get("/status", this.getUserStatus.bind(this));
        return router;
    }

    get(req: express.Request, res: express.Response) {
        return this.userService.list()
                .then((data) => {
                    res.json(data)
                })
                .catch((err: express.Errback) => {
                    res.status(500).json(err)
                });
    }

    getCoins(req: express.Request, res: express.Response) {
        return this.userService.getUserCoins(req.user.id).then((coins) => {
                if (coins) {
                    res.json(coins); 
                } else {
                    res.json(null)
                }
        });
    }

    getTransaction(req: express.Request, res: express.Response){
        return this.accountService.getUserTransaction(req.user.id).then((data) => {
                res.json(data);
        }).catch((err) => {
            res.json(err);
        })
    }

    getUser(req: express.Request, res: express.Response) {
        return this.userService.findById(req.user.id).then((user) => {
            res.json({
                user_id: user.id,
                name: user.name,
                username: user.username
            });
        }).catch((err) => {
            res.status(400).json(err);
        });
    }

    getAccount(req: express.Request, res: express.Response) {
        return this.accountService.getBalance(req.user.id).then((data) => {
            res.json(data);
        })
    }

    getUserStatus(req: express.Request, res: express.Response) {
        return this.accountService.getBalance(req.user.id).then((data) => {
            const current_balance = data.amount;
            
            this.userService.getUserCoins(req.user.id).then((coins) => {
                let liquid_asset = 0;
                
                if (coins) {
                    Object.keys(coins).map((k, v) => {
                        liquid_asset =+ coins[k].quotes.HKD.price * coins[k].quantity;
                    })
                    
                } 

                const total_diff = (current_balance + liquid_asset) - 100000;
                    
                const status = Math.round(total_diff/10)/100;


                res.json({
                    status: status 
                })
            });
        })
         
    }
}


