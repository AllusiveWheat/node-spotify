import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv-safe";
import qs from "qs";
import express from "express";
import axios from "axios";
import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";

const app = express();
dotenv.config();
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
passport.use(
  new SpotifyStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: "http://localhost:3000/callback",
      scope: ["user-read-email", "user-read-private"],
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      accessToken = accessToken;
      refreshToken = refreshToken;
      expires_in = expires_in;
      console.log(profile);
      done(null, profile);
    }
  )
);

var spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: "http://localhost:3000/callback",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
}

app.get("/auth", passport.authenticate("spotify"));

app.get("/callback",passport., (req, res) => {

  res.send("You are now logged in!");
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
