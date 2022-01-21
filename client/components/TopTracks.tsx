import { useState, useEffect } from "react";
import axios from "axios";
const TopTracks = () => {
  const [tracks, setTracks] = useState<any>([]);
  const [genres, setGenres] = useState<any>([]);
  const [name, setName] = useState<any>("");
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
          await axios
            .get("http://localhost:4000/topgenres", { withCredentials: true })
            .then((res) => {
              console.log(res.data);
              setGenres(res.data);
            });
        } else {
        }
      });
  }, []);

  return (
    <div className=" flex flex-row dark:bg-gray-900 text-white content-center">
      <div className="tracks">
        {tracks.map((track: any) => (
          <div className="track text-center bg-center mt-4" key={track.id}>
            <img src={track.album.images[0].url} height={100} width={100} />
            <a href={track.external_urls.spotify} className="text-blue-600">
              <h3>{track.name}</h3>
            </a>
            <a href={track.artists[0].external_urls.spotify}>
              <h3>{track.artists[0].name}</h3>
            </a>
            <button
              onClick={() => {
                console.log(track.id);
                axios.get(`http://localhost:4000/play?id=${track.id}`, {
                  withCredentials: true,
                });
              }}
            >
              Play Song
            </button>
          </div>
        ))}
      </div>
      <div className="genres">
        {genres.map((genre: any) => (
          <div className="genre text-center bg-center mt-4" key={genre}>
            <h3>{genre}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
