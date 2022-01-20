import axios from "axios";
import React, { Children, useEffect, useState } from "react";
import Player from "../components/Player";
import TopTracks from "../components/TopTracks";
const loggedin = () => {
  const [player, setPlayer] = useState<any>(false);
  if (player) {
    return (
      <div>
        <Player />
        <TopTracks />
      </div>
    );
  }
  return (
    <>
      {/* Toggle Player With a button */}
      <button onClick={() => setPlayer(true)}>Play</button>
      <TopTracks />
    </>
  );
};

export default loggedin;
