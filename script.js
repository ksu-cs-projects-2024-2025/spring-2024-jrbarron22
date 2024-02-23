import { processSb3File } from './src/index.js';
//import { music } from './src/music/musicNotation.js'

console.log("Start of program");

var fileName = prompt("Enter the filepath of the scratch project: ");
var extension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || fileName;
//console.log(extension);
if(extension != 'sb3'){
    console.log("Incorrect File Extention: " + extension);
    process.exit(1);
}

processSb3File(fileName);
