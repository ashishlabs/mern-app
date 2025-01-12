import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as mm from "music-metadata";
import SpotifyWebApi from 'spotify-web-api-node';
import logger from "../../utils/logger";

const musicDir = path.join(__dirname, "../music");

// Add interface for metadata types
interface BasicMetadata {
  filename: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  year?: number;
  bitrate?: number;
  sampleRate?: number;
}

interface OnlineMetadata {
  artistInfo: {
    name: string;
    genres?: string;
    popularity?: number;
    images?: any[];
  };
  trackInfo: {
    name: string;
    album: string;
    releaseDate?: string;
    popularity?: number;
    previewUrl?: string;
    albumArt?: any[];
  };
}

interface FullMetadata extends BasicMetadata {
  online?: OnlineMetadata;
}


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const getOnlineMetadata = async (artist: string, title: string): Promise<OnlineMetadata | null> => {
  try {
    // Refresh access token
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    // Search for track
    const searchResult = await spotifyApi.searchTracks(`track:${title} artist:${artist}`);
    const track = searchResult.body.tracks?.items[0];
    if (!track) return null;

    // Get artist details
    const artistData = await spotifyApi.getArtist(track.artists[0].id);

    return {
      artistInfo: {
        name: artistData.body.name,
        genres: artistData.body.genres.join(', '),
        popularity: artistData.body.popularity,
        images: artistData.body.images
      },
      trackInfo: {
        name: track.name,
        album: track.album.name,
        releaseDate: track.album.release_date,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        albumArt: track.album.images
      }
    };
  } catch (err) {
    console.error(`Failed to fetch Spotify metadata for ${artist} - ${title}:`, err);
    return null;
  }
};

const getSongMetadata = async (file: string): Promise<BasicMetadata | FullMetadata> => {
  if (!file || typeof file !== 'string') {
    throw new Error('Invalid file name provided');
  }

  logger.error(`getSongMetadata: ${file}`);

  const filePath = path.join(musicDir, file);

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${file}`);
  }

  try {
    const metadata = await mm.parseFile(filePath);
    const basicInfo = {
      filename: file,
      title: metadata.common.title || path.parse(file).name,
      artist: metadata.common.artist || "Unknown Artist",
      album: metadata.common.album || "Unknown Album",
      genre: metadata.common.genre?.join(", ") || "Unknown Genre",
      duration: metadata.format.duration,
      year: metadata.common.year,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate
    };

    // Get additional online metadata if artist is known
    if (basicInfo.artist !== "Unknown Artist") {
      const onlineData = await getOnlineMetadata(basicInfo.artist, basicInfo.title);
      if (onlineData) {
        return {
          ...basicInfo,
          online: onlineData
        };
      }
    }
    return basicInfo;
  } catch (err) {
    console.error(`Failed to read metadata for ${file}:`, err);
    return {
      filename: file,
      title: path.parse(file).name,
      artist: "Unknown Artist",
      album: "Unknown Album",
      genre: "Unknown Genre",
      duration: 0
    };
  }
};

export const getSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!fs.existsSync(musicDir)) {
      throw new Error('Music directory not found');
    }

    const files = await fs.promises.readdir(musicDir);
    const mp3Files = files.filter((file) => file.toLowerCase().endsWith(".mp3"));

    if (mp3Files.length === 0) {
      res.json([]);
      return;
    }
    const songsPromises = mp3Files.map(getSongMetadata);
    const songs = await Promise.all(songsPromises);
    res.json(songs);
  } catch (err) {
    console.error("Failed to read music directory:", err);
    res.status(500).json({
      error: 'Failed to read music directory',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};


