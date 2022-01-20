import axios from "axios";
import React, { useEffect, useState } from "react";
import Player from "../components/Player";
const loggedin = () => {
  const [tracks, setTracks] = useState<any>([]);
  const [genres, setGenres] = useState<any>([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then(async (res) => {
        if (res.status === 200) {
          await axios
            .get("http://localhost:4000/toptracks", { withCredentials: true })
            .then((res) => {
              console.log(res.data);
              setTracks(res.data);
            });
        }
      });
    axios
      .get("http://localhost:4000/topgenres", { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        setGenres(res.data);
      });
  }, []);
  let player = false;
  if (player) {
    return <Player />;
  }
  return (
    <>
      <h1> Player</h1>
      <input type="button" value="Play" onClick={() => (player = true)} />
      <div className="flex flex-row bg-gray-900">
        <h2>Top Tracks</h2>
        <div className="top-tracks-container">
          {tracks.map((track: any) => (
            <div className="track" key={track.id}>
              <img src={track.album.images[0].url} height={100} width={100} />
              <a href={track.external_urls.spotify} className="text-blue-600">
                <h3>{track.name}</h3>
              </a>
              <h3>{track.artists[0].name}</h3>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default loggedin;
