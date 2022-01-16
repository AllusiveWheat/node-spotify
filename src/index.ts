import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv-safe";
import qs from "qs";
import express from "express";
import axios from "axios";
import fetch from "node-fetch";
const app = express();
dotenv.config();
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

var spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: "http://localhost:3000/callback",
});

app.get("/", (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      qs.stringify({
        response_type: "code",
        client_id: clientId,
        scope: "user-read-private user-read-email",
        redirect_uri: "http://localhost:3000/callback",
        state: "some-state-of-my-choice",
      })
  );
});

app.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const authEndpoint = "https://accounts.spotify.com/api/token";
  const authHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
  };
  const authBody = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: "http://localhost:3000/callback",
  };
  const authRequest = {
    method: "POST",
    headers: authHeaders,
    body: qs.stringify(authBody),
  };
  fetch(authEndpoint, authRequest)
    .then((response) => response.json())
    .then((json: any) => {
      spotifyApi.setAccessToken(json.access_token);
      spotifyApi.setRefreshToken(json.refresh_token);
      spotifyApi.getMe().then((data) => {
        console.log(data.body);
      });
      res.send(json);
    });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
