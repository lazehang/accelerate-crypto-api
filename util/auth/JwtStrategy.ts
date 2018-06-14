import * as passport    from 'passport'
import * as PassportJWT from 'passport-jwt';
import config           from '../../config';
import UserService      from '../../services/UserService';

export default function(userService: UserService){
    const strategy = new PassportJWT.Strategy({
        secretOrKey     : config.jwtSecret,
        jwtFromRequest  : PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (payload, done) => { 
        console.log("payload", payload);
        const user = await userService.findByUsername(payload.username);
        return (user) ? done(null, {id: user.id}) : done(new Error("User not found"), null);
    });

    passport.use(strategy);

    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate("jwt", config.jwtSession)
    };
}