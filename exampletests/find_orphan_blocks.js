import { processSb3File } from "../src/index.js";
import { orphanSort } from "../src/orphans.js";

console.log("Start of Program");

var fileName = "./testScratchModule.sb3";

var ast = processSb3File(fileName);
orphanSort(ast);