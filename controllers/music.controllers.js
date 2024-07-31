import Music from '../models/music.model.js';

export const addMusic = async (req, res) => {
    const { title, artist, duration } = req.body;
    const musicFile = req.files['musicFile'] ? req.files['musicFile'][0] : null;
    const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

    if (!title || !artist || !musicFile || !duration || !coverImage) {
        return res.status(400).send({ error: "Please fill all fields" });
    }

    try {
        const newMusic = await Music.create({
            title,
            artist,
            url: musicFile.path,
            coverImage: coverImage.path,
            duration
        });
        res.status(201).send(newMusic);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
};

export const getMusicList = async (req, res) => {
    try {
        const musicList = await Music.find();
        res.status(200).send(musicList);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
};
