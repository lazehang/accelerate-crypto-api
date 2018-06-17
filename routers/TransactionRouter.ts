import * as express from 'express';
import AccountService from '../services/AccountService';
import CoinService from '../services/CoinService';

/**
 * Transaction Routes
 * -------------------------
 * Handle requests from /
 */
export default class TransactionRouter{
    private accountService: AccountService;
    private coinService: CoinService;

    constructor(accountService: AccountService, coinService: CoinService){
        this.accountService = accountService;
        this.coinService = coinService;
    }

    getRouter(){
        let router = express.Router();
        router.post("/ready", this.getReady.bind(this));
        router.post("/buy", this.buy.bind(this));
        router.post("/sell", this.sell.bind(this));        
        return router;
    }

    buy(req: express.Request, res: express.Response) {
        this.accountService.buy(req.user.id, req.body.amount).then((data) => {
            this.coinService.add(req.body.coinId, req.body.coinQuantiy, req.body.id);
            res.json("Buy"); 
        })
    }

    sell(req: express.Request, res: express.Response) {
        res.json("Sell");
                
    }

    getReady(req: express.Request, res: express.Response) {
        this.coinService.convert(req.body.amount, req.body.coinId, req.user.id)
        .then((coinDetail) => {
            console.log(coinDetail);
            res.json(coinDetail);
        })
        
    }
}


