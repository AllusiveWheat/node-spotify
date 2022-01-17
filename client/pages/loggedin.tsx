import axios from "axios";
import React, { useEffect, useState } from "react";
const loggedin = () => {
  const [playing, setPlaying] = useState<any>([]);
  const [image, setImage] = useState<any>("");
  const [artist, setArtist] = useState<any>([{}]);
  const [pos, setPos] = useState<any>(0);

  let loggedIn = true;

  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          loggedIn = true;
          axios
            .get("http://localhost:4000/playing", { withCredentials: true })
            .then((res) => {
              console.log(res.data);
              console.log(res.data.album.images[0].url);
              setImage(res.data.album.images[0].url);
              console.log(res.data.artists[0].name);
              setArtist(res.data.artists);
              setPlaying(res.data);
              console.log(res.data.duration_ms);
            });
          axios
            .get(`http://localhost:4000/pos`, {
              withCredentials: true,
            })
            .then((res) => {
              console.log(res);
              setPos(res.data);
            });
        }
      });
  }, []);

  return (
    <div>
      <h2>{playing.name}</h2>
      {artist.map((artist: any) => (
        <h3 key={artist.id}>{artist.name}</h3>
      ))}
      <img src={image} key={artist.id} height={100} width={100} />
      <input
        type="range"
        min="0"
        max={playing.duration_ms}
        value={pos}
        onTimeUpdate={(e) => {
          setPos(pos);
        }}
        onChange={(e) => {
          console.log(e.target.value);
          console.log(loggedIn);
          setPos(e.target.value);
          axios({
            method: "put",
            url: `http://localhost:4000/playing?pos=${e.target.value}`,
            withCredentials: true,
          });
        }}
      />

      <button
        onClick={() => {
          axios({
            method: "post",
            url: `http://localhost:4000/play`,
            withCredentials: true,
          });
        }}
      >
        Play
      </button>

      <button
        onClick={() => {
          axios({
            method: "post",
            url: `http://localhost:4000/pause`,
            withCredentials: true,
          });
        }}
      >
        Pause
      </button>
    </div>
  );
};

export default loggedin;
