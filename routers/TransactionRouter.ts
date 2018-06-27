import * as express from 'express';
import AccountService from '../services/AccountService';
import CoinService from '../services/CoinService';
import { resolveSoa } from 'dns';

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
    
       return this.accountService.buy(req.user.id, req.body.amount).then((data) => {
            if (data) {
                this.coinService.add(req.body.coin_id, req.body.coinQuantity, req.user.id);
                var io = req.app.get('socketio');

                this.accountService.getBalance(req.user.id).then((account) => {
                    console.log(account);
                    io.emit('action', {type: 'SOCKET_UPDATE_BALANCE', account});    
                })

                res.json(data); 
            }else {
                res.status(500).json("Error !!")
            }
            
        }).catch((err) => res.status(500).json(err.message))
    }

    sell(req: express.Request, res: express.Response) {
        return this.accountService.sell(req.user.id, req.body.amount)
                .then((data) => {
                    this.coinService.deduct(req.body.coin_id, req.body.coinQuantity, req.user.id);
                        var io = req.app.get('socketio');

                        this.accountService.getBalance(req.user.id).then((account) => {
                            console.log(account);
                            io.emit('action', {type: 'SOCKET_UPDATE_BALANCE', account});    
                        })
                })
                
    }

    getReady(req: express.Request, res: express.Response) {
        console.log(req.user.id);
        this.coinService.convert(req.body.amount, req.body.coin_id, req.user.id)
        .then((coinDetail) => {
            res.json(coinDetail);
        }).catch((err) => {
            res.status(400).json(err);
        })
        
    }
}


