import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: Express.User | false) => void
    ) => {
      // In a real-world app, you would save the user to the database here
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

export default passport;
