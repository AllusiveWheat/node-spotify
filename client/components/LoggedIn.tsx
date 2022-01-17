import axios from "axios";
import React, { useEffect } from "react";

export const LoggedIn = () => {
  // Make an API call to get the user's data
  // If the user is logged in, display their name and avatar
  // If the user is not logged in, display a login button

  useEffect(() => {
    axios
      .get("http://localhost:4000/checklogin", { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          axios
            .get("http://localhost:4000/playing", { withCredentials: true })
            .then((res) => {
              console.log(res.data);
            });
        }
      });
  }, []);

  return (
    <div>
      <h1>Logged In</h1>
    </div>
  );
};
