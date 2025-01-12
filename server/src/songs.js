const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const songsFolder = path.join(__dirname, 'music');

async function getMetadata(filePath) {
    try {
        // Read the metadata from the MP3 file using node-id3
        const tags = NodeID3.read(filePath);

        // Extract the necessary fields
        const { title, artist, album, genre, picture } = tags;

        // Get the file duration
        const duration = getDuration(filePath);

        return {
            title: title || path.basename(filePath, path.extname(filePath)),
            artist: artist || "Unknown Artist",
            album: album || "Unknown Album",
            genre: genre || "Unknown Genre",
            duration: duration,
            coverArt: picture ? `data:image/jpeg;base64,${picture.toString('base64')}` : null,
            thumbnail: picture ? `data:image/jpeg;base64,${picture.toString('base64')}` : null,
        };
    } catch (error) {
        console.error(`Error reading metadata for ${filePath}:`, error.message);
        return {
            title: path.basename(filePath, path.extname(filePath)),
            artist: "Unknown Artist",
            album: "Unknown Album",
            genre: "Unknown Genre",
            duration: 0,
            coverArt: null,
            thumbnail: null,
        };
    }
}

// Function to get the duration of the audio file (in seconds)
function getDuration(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size / 1024 / 1024; // Approximate duration based on file size (not accurate but serves as a placeholder)
}

async function getSongsData() {
    const songs = [];
    const audioExtensions = ['.mp3'];
    const files = fs.readdirSync(songsFolder);

    for (const [index, file] of files.entries()) {
        const ext = path.extname(file).toLowerCase();

        if (audioExtensions.includes(ext)) {
            const filePath = path.join(songsFolder, file);
            const metadata = await getMetadata(filePath);

            songs.push({
                id: (index + 1).toString(),
                title: metadata.title,
                artist: metadata.artist,
                album: metadata.album,
                genre: metadata.genre,
                duration: metadata.duration,
                coverArt: metadata.coverArt,
                thumbnail: metadata.thumbnail,
                url: `/songs/${file}`,
                filename: file,
            });
        }
    }

    return songs;
}

(async () => {
    const songsData = await getSongsData();

    console.log(JSON.stringify(songsData, null, 2)); // Logs the data to the console

    // Optional: Save to a JSON file
    fs.writeFileSync('songsData.json', JSON.stringify(songsData, null, 2), 'utf-8');
})();
