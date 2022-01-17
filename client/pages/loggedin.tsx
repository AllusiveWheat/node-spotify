import axios from "axios";
import React, { useEffect, useState } from "react";

const loggedin = () => {
  // Make an API call to get the user's data
  // If the user is logged in, display their name and avatar
  // If the user is not logged in, display a login button
  const [playing, setPlaying] = useState<any>([]);
  const [image, setImage] = useState<any>("");
  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          axios
            .get("http://localhost:4000/playing", { withCredentials: true })
            .then((res) => {
              console.log(res.data);
              console.log(res.data.album.images[0].url);
              setImage(res.data.album.images[0].url);
              setPlaying(res.data);
            });
        }
      });
  }, []);

  return (
    <div>
      <h1>Logged In</h1>
      <h2>{playing.name}</h2>
      <img src={image} height={100} width={100} />
    </div>
  );
};

export default loggedin;
