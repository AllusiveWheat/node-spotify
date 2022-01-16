import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv-safe";
import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { createConnection } from "typeorm";
async () => {
  const app = express();
  dotenv.config();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: false,
        httpOnly: false,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: "http://localhost:3000/callback",
  });

  passport.use(
    new SpotifyStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: "http://localhost:3000/callback",
        scope: [
          "user-read-email",
          "user-read-private",
          "user-read-currently-playing",
        ],
        showDialog: true,
      },
      (accessToken, refreshToken, expires_in, profile, done) => {
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("expires_in", expires_in);
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);
        console.log("profile", profile);
        done(null, profile);
      }
    )
  );

  app.get("/", (req, res) => {
    if (!req.user) {
      console.log("req.user", req.user);
      res.send("You are not logged in");
    } else {
      res.send(`You are logged in as ${req.user.displayName}`);
    }
  });

  app.get("/auth", passport.authenticate("spotify"));

  app.get(
    "/callback",
    passport.authenticate("spotify", {
      userProperty: "user",
      authInfo: true,
    }),
    (req, res) => {
      console.log("req.user", req.user);
      res.redirect("/");
    }
  );

  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
};
