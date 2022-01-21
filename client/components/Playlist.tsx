import { useEffect, useState } from "react";
import axios from "axios";
const Playlist = () => {
  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then(async (res) => {
        if (res.status === 200) {
        }
      });
  }, []);

  return <div></div>;
};
export default Playlist;
