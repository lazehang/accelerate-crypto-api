import * as express from 'express';
import UserService from '../services/UserService';
import AccountService from '../services/AccountService';
import { stat } from 'fs';

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
        router.get("/user/:id", this.getUser.bind(this));
        router.get("/account/:id", this.getAccount.bind(this));
        router.get("/coins/:id", this.getCoins.bind(this));
        router.get("/log/:id", this.getTransaction.bind(this));
        router.get("/status/:id", this.getUserStatus.bind(this));
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
        return this.userService.getUserCoins(parseInt(req.params.id)).then((coins) => {
                if (coins) {
                    res.json(coins); 
                } else {
                    res.json(null)
                }
        });
    }

    getTransaction(req: express.Request, res: express.Response){
        return this.accountService.getUserTransaction(parseInt(req.params.id)).then((data) => {
                res.json(data);
        }).catch((err) => {
            res.json(err);
        })
    }

    getUser(req: express.Request, res: express.Response) {
        return this.userService.findById(parseInt(req.params.id)).then((user) => {
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
        return this.accountService.getBalance(parseInt(req.params.id)).then((data) => {
            res.json(data);
        })
    }

    getUserStatus(req: express.Request, res: express.Response) {
        return this.accountService.getBalance(parseInt(req.params.id)).then((data) => {
            const current_balance = data.amount;
            
            this.userService.getUserCoins(parseInt(req.params.id)).then((coins) => {
                let liquid_asset = 0;
                
                if (coins) {
                    Object.keys(coins).map((k, v) => {
                        liquid_asset += coins[k].quotes.HKD.price * coins[k].quantity;
                    })  
                } 
                console.log('liquid asset', liquid_asset)
                const total_diff = (current_balance + liquid_asset) - 100000;
                console.log(current_balance + liquid_asset);
                    
                const status = Math.round(total_diff/10)/100;
                console.log(status)

                res.json({
                    status: status 
                })
            });
        })
         
    }
}


