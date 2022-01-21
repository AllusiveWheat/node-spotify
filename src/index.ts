import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv-safe";
import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { createConnection } from "typeorm";
import { v4 } from "uuid";
import { User } from "./User";
import Redis from "ioredis";
import qs from "qs";
import connctRedis from "connect-redis";
import cors from "cors";
import fs, { appendFile } from "fs";
const main = async (): Promise<void> => {
  const conn = await createConnection({
    type: "postgres",
    database: process.env.DB_NAME || "node",
    username: "postgres",
    password: process.env.DB_PASSWORD || "1",
    logging: true,
    synchronize: true,
    entities: [User],
  });

  const redis = new Redis();
  const RedisStore = connctRedis(session);
  const app = express();
  dotenv.config();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    const user = await User.findOne(id);
    done(null, user);
  });
  app.use(
    session({
      secret: "keyboard cat",
      name: "qid",
      store: new RedisStore({ client: redis }),
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
    redirectUri: "http://localhost:4000/auth/spotify/callback",
  });

  passport.use(
    new SpotifyStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: "http://localhost:4000/auth/spotify/callback",
        scope: [
          "user-read-email",
          "user-read-private",
          "user-read-currently-playing",
          "user-read-playback-state",
          "user-modify-playback-state",
          "user-library-modify",
          "user-library-read",
          "streaming",
          "app-remote-control",
          "user-read-playback-position",
          "user-top-read",
          "user-read-recently-played",
        ],
        showDialog: true,
      },
      async (accessToken, refreshToken, expires_in, profile, done) => {
        const existingUsers = await User.find();

        const existingUser = existingUsers.find(
          (user) => user.spotifyId === profile.id
        );
        if (existingUser) {
          existingUser.spotifyAccessToken = accessToken;
          existingUser.spotifyRefreshToken = refreshToken;
          existingUser.spotifyExpiresIn = expires_in;
          existingUser.displayName = profile.displayName;
          existingUser.__json = JSON.stringify(profile);

          await existingUser.save();
          return done(null, existingUser);
        } else {
          const user = new User();
          user.id = v4();
          user.email = profile.emails![0].value;
          user.spotifyAccessToken = accessToken;
          user.spotifyRefreshToken = refreshToken;
          user.password = accessToken;
          user.spotifyExpiresIn = expires_in;
          user.spotifyId = profile.id;
          user.spotifyImageUrl = profile.photos![0];
          user.displayName = profile.displayName;
          user.__json = JSON.stringify(profile);
          user.save();
          spotifyApi.setAccessToken(accessToken);
          spotifyApi.setRefreshToken(refreshToken);
          done(null, user);
        }
      }
    )
  );

  app.get("/", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in");
    } else {
      res.send(`You are logged in as ${req.user.displayName}`);
    }
  });

  app.get("/auth/spotify", passport.authenticate("spotify"));
  app.get("/checklogin", (req, res) => {
    if (!req.user) {
      res.status(401).send("You are not logged in");
    } else {
      spotifyApi.setRefreshToken(req.user!.spotifyRefreshToken);
      spotifyApi.refreshAccessToken().then((data) => {
        res.send(data.body).status(200);
      });
    }
  });
  app.get(
    "/auth/spotify/callback",
    passport.authenticate("spotify", {
      userProperty: "user",
      authInfo: true,
    }),
    (req, res) => {
      res.redirect("http://localhost:3000/loggedin");
    }
  );

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/playing", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in");
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi
        .getMyCurrentPlaybackState({
          market: "US",
        })
        .then((data) => {
          console.log(data.body.item);
          res.send(data.body.item);
        });
    }
  });

  app.get("/playingArtists", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in");
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi
        .getMyCurrentPlaybackState({
          market: "US",
        })
        .then((data) => {
          if (data != null) {
            console.log(data.body.item);
            //@ts-ignore
            spotifyApi.getArtist(data.body.item.artists[0].id).then((data) => {
              res.send(data.body);
            });
          }
        });
    }
  });

  app.put("/playing", (req, res) => {
    // parsed query string from req.query
    const parsed = qs.stringify(req.query);
    const posBase = parsed.split("=")[1];
    console.log("posBase:", posBase);
    const pos = parseInt(posBase);
    console.log("pos:", pos);
    if (!req.user) {
      res.send("You are not logged in");
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.seek(pos).then((data) => {
        res.send(data);
      });
    }
  });

  app.get("/pos", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.getMyCurrentPlaybackState().then((data) => {
        res.json(data.body.progress_ms);
      });
    }
  });
  app.post("/play", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.play().then((data) => {
        if (data.statusCode === 204) {
          res.send(data);
        } else {
          spotifyApi.pause().then((data) => {
            res.send(data);
          });
        }
      });
    }
  });
  app.post("/pause", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      try {
        const resp = spotifyApi.pause();
        res.send(resp);
      } catch (err) {
        console.log(err);
      }
    }
  });
  app.post("/next", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.skipToNext().then((data) => {
        if (data.statusCode === 204) {
          res.send(data);
        } else res.send(data).status(500);
      });
    }
  });
  app.post("/prev", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.skipToPrevious().then((data) => {
        if (data.statusCode === 204) {
          res.send(data).status(200);
        } else if (data.statusCode === 403) {
          res.send(data).status(500);
        }
      });
    }
  });
  app.post("/shuffle", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
    }
  });
  app.post("/repeat", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.setRepeat(req.body.state).then((data) => {
        res.send(data);
      });
    }
  });

  app.get("/top", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.getMyTopArtists().then((data) => {
        res.send(data.body.items);
      });
    }
  });

  app.get("/toptracks", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi
        .getMyTopTracks({
          time_range: "short_term",
        })
        .then((data) => {
          res.send(data.body.items);
        });
    }
  });

  app.get("/topgenres", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.getMyTopArtists().then((data) => {
        const genres: any = [];
        data.body.items.forEach((artist) => {
          artist.genres.forEach((genre) => {
            if (!genres.includes(genre)) {
              console.log(genre);
              genres.push(genre);
            }
          });
        });
        res.send(genres);
      });
    }
  });
  app.post("/play", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.searchTracks(req.body.song).then((data) => {
        spotifyApi
          .play({
            uris: [data.body.tracks!.items[0].uri],
          })
          .then((data) => {
            res.send(data);
          });
      });
    }
  });
  app.get("/play", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      console.log(req.query);
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi
        .play({ uris: [`spotify:track:${req.query.id}`] })
        .then((data) => {
          res.send(data);
        });
    }
  });

  app.post("/playID", (req, res) => {
    if (!req.user) {
      res.send("You are not logged in").status(401);
    } else {
      spotifyApi.setAccessToken(req.user.spotifyAccessToken);
      spotifyApi.setRefreshToken(req.user.spotifyRefreshToken);
      spotifyApi.play({ uris: [req.body.song] }).then((data) => {
        console.log("Here");
        res.send(data);
      });
    }
  });

  app.listen(4000, () => {
    console.log("Server started on port 4000");
  });
};

main();
