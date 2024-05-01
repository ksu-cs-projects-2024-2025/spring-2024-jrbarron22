import Parser from "./parser.js";
import  Song  from "../src/music/song.js";
import { unzipSb3 } from '../src/utils/sb3Unzipp.js';

var fileName = "./sb3Test.sb3";

const unzippedFilePath = await unzipSb3(fileName);

var parser = new Parser();
var nodeList = await parser.parse(unzippedFilePath);

//console.log(nodeList);

var song = new Song(nodeList);

console.log(song.music);