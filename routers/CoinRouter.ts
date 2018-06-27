import * as express from 'express';
import CoinService from '../services/CoinService';

/**
 * Coin Routes
 * -------------------------
 * Handle requests from /coins
 */
export default class CoinRouter{
    private coinService: CoinService;

    constructor(coinService: CoinService){
        this.coinService = coinService;
    }

    getRouter(){
        let router = express.Router();
        router.get("/", this.get.bind(this));
        router.get("/price/:id", this.getPrice.bind(this));                        
        router.get("/:id", this.getById.bind(this)); 
        return router;
    }

    get(req: express.Request, res: express.Response) {

        console.log("COINS HERE");
        this.coinService.getAll()
        .then((coins) => {
            res.status(200).json(coins);   
        }).catch((err) => console.log(err.message));
        
    }

    getById(req: express.Request, res: express.Response) {
        this.coinService.getById(req.params.id)
        .then((coins) => {
            res.status(200).send(coins);   
        }).catch((err) => console.log(err.message));
        
    }

    getPrice(req: express.Request, res: express.Response) {
        this.coinService.getPriceById(req.params.id).then((data) => {
            console.log(data);
            res.status(200).json(data);
        });
    }
}


