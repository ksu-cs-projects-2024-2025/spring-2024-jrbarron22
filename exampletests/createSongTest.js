const Parser = require("./parser.js");
const Song = require("../src/music/song.js");
const unzipSb3 = require('../src/utils/sb3Unzipp.js');
const fs = require('fs');

var fileName = "./oj.sb3";

async function process(){
    var parser = new Parser();
    var nodeList = await parser.parse(fileName);

    //console.log(nodeList);

    var song = new Song(nodeList);

    console.log(song.music);

    fs.writeFileSync("ojSong.json", JSON.stringify(song.music), {encoding:"utf-8"});
}

process();