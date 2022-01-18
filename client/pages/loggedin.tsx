import axios from "axios";
import React, { useEffect, useState } from "react";
const loggedin = () => {
  const [playing, setPlaying] = useState<any>([]);
  const [image, setImage] = useState<any>("");
  const [artist, setArtist] = useState<any>([{}]);
  const [pos, setPos] = useState<any>(0);
  const [time, setTime] = useState<string>();
  let loggedIn = true;
  function convertTime(mill: number): string {
    let minutes = Math.floor(mill / 60000);
    let seconds = (mill % 60000) / 1000;
    let x = parseFloat(seconds.toFixed(0));
    return `${minutes}:${x < 10 ? "0" : ""}${x}`;
  }
  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          loggedIn = true;
          axios
            .get("http://localhost:4000/playing", { withCredentials: true })
            .then((res) => {
              setImage(res.data.album.images[0].url);
              setArtist(res.data.artists);
              setPlaying(res.data);
            });
          axios
            .get(`http://localhost:4000/pos`, {
              withCredentials: true,
            })
            .then((res) => {
              console.log(res);
              setPos(res.data);
            });

          setInterval(() => {
            axios
              .get(`http://localhost:4000/pos`, {
                withCredentials: true,
              })
              .then((res) => {
                setPos(res.data);
              });
          }, 1000);

          setInterval(() => {
            axios
              .get("http://localhost:4000/playing", { withCredentials: true })
              .then((res) => {
                setImage(res.data.album.images[0].url);
                setArtist(res.data.artists);
                setPlaying(res.data);
              });
          }, 1000);
        } else {
          loggedIn = false;
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
      <button
        onClick={() => {
          axios({
            method: "post",
            url: `http://localhost:4000/next`,
            withCredentials: true,
          });
        }}
      >
        Next
      </button>
      <button
        onClick={() => {
          axios({
            method: "post",
            url: `http://localhost:4000/prev`,
            withCredentials: true,
          });
        }}
      >
        Prev
      </button>
      {/* Time in Song */}
      <h3>{convertTime(pos)}</h3>
    </div>
  );
};

export default loggedin;
