//fs.writeFileSync
//import { unzipSb3 } from '../src/utils/sb3Unzipp.js';
const Parser = require("./parser.js");
const Song = require("../src/music/song.js");

var sb3File1 = "./4-music.sb3";
var sb3File2 = "./oj.sb3";

async function process(){
    var parser = new Parser();
    //const unzippedFilePath1 = await unzipSb3(sb3File1);
    var nodeList1 = await parser.parse(sb3File1);
    var song1 = new Song(nodeList1);


    //const unzippedFilePath2 = await unzipSb3(sb3File2);
    var nodeList2 = await parser.parse(sb3File2);
    var song2 = new Song(nodeList2);

    //console.log("Song 1: ", song1.music);
    //console.log("Song 2: ", song2.music);

    console.log(song1.compareSong(song2));
}

process();