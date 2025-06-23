import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import User from "../Models/UserModel.mjs";
import {config} from 'dotenv'
config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({email});
      if (user) {
        return done(null, user);
      }

      // If not, create a new user
      user = await User.create({
        email: email,
        username: profile.displayName,
        password:'',
      });

      done(null, user);
    } catch (error) {
      console.error("Error during Google authentication:", error);
      done(error, null);
    }
  }
)); 
