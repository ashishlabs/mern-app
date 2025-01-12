// song.model.ts

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    genre: string;
    duration: number;
    coverArt: string | null;
    thumbnail: string | null;
    url: string;
    fileName:string;
    playCount?: number;
    albumName?: string;
    isTopPlayed?: boolean;
    albumArt?: string;
    explicit?: boolean;
}

