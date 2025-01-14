const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({
            where: {
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            }
        });

        if (user) {
            // Mettre à jour les informations Google si nécessaire
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Créer un nouvel utilisateur
        user = await User.create({
            email: profile.emails[0].value,
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            isEmailVerified: true // L'email est déjà vérifié par Google
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

module.exports = passport;