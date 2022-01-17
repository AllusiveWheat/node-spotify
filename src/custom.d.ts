declare namespace Express {
  export interface User {
    displayName: string;
    id: string;
    email: string;
    password: string;
    spotifyId: string;
    spotifyAccessToken: string;
    spotifyRefreshToken: string;
    spotifyExpiresIn: number;
    spotifyImageUrl: string;
    __json: string;
  }
}
