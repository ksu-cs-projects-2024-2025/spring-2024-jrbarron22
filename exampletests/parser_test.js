import { unzipSb3 } from '../src/utils/sb3Unzipp.js';
import Parser from "./parser.js";

var sb3FilePath = "./sb3Test.sb3";

const unzippedFilePath = await unzipSb3(sb3FilePath);

var parser = new Parser();
var nodeList = await parser.parse(unzippedFilePath);

console.log(nodeList);