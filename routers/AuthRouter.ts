import * as express     from 'express';
import axios            from 'axios';
import * as jwtSimple   from 'jwt-simple';
import config           from '../config';
import UserService from '../services/UserService';
import * as passport from 'passport';

/**
 * API Routes
 * -------------------------
 * Handle requests from /api
 */
export default class AuthRouter{
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    getRouter() {
        const router = express.Router();
        router.post("/google", this.loginWithGoogle.bind(this));
        router.post("/login", this.login.bind(this));
        router.post('/register', this.register.bind(this));
        return router;
    }

    async loginWithGoogle(req: express.Request, res: express.Response) {
        const accessToken = req.body.accessToken;
        console.log(accessToken);
        
        if (!accessToken) {
            res.sendStatus(401);
        }
        
        try {
            const authResult  = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`)

            if (authResult.data.error) {
                res.sendStatus(401);
            }
            
            const token = jwtSimple.encode({ id: accessToken, info: authResult.data }, config.jwtSecret);
            res.json({ token: token });
        } catch(err) {
            res.sendStatus(401);
        }
    }

    login(req: express.Request, res: express.Response, next: express.NextFunction) {
        passport.authenticate('local-login', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }

            req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                var payload = {
                    id: user.id,
                    username: user.username
                }
                var token = jwtSimple.encode(payload, config.jwtSecret);

                return res.json({ user, token });
            });
        })(req, res, next);

    }

    register(req: express.Request, res: express.Response) {
        console.log(req.body.username, req.body.name, req.body.password)
        this.userService.register(req.body.username, req.body.name, req.body.password, req.body.isAdmin ? req.body.isAdmin:false).then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => res.status(400).json(err));
    }
}



