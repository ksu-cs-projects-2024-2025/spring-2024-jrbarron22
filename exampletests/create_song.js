import { processSb3File } from "../src/index.js";
import { Song } from "../src/music/song.js";

var fileName = "./4-music.sb3";

var project = await processSb3File(fileName);
var song = Song(project.ast);

console.log(song.music);