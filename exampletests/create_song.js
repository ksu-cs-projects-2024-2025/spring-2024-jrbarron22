import { processSb3File } from "../src/index.js";
import  Song  from "../src/music/song.js";

var fileName = "./orphanTest2.sb3";

var project = await processSb3File(fileName);
var song = new Song(project.ast);

console.log(song.music);