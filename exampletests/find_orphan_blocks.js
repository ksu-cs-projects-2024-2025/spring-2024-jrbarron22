import { processSb3File } from "../src/index.js";
//import { orphanSort } from "../src/orphans.js";

console.log("Start of Program");

var fileName = "./orphanTest1.sb3";

var project = await processSb3File(fileName);
project.getOrphans();
//console.log('project', project);
//console.log('orphans', project.getOrphans());
//console.log(ast);
//orphanSort(ast);
//console.log(blocks);
//console.log("Number of Orphans: %d\n", blocks[0]);
//console.log("Number of non-Orphans: %d\n", blocks[1]);