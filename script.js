import { processSb3File } from './src/index.js';
//import { music } from './src/music/musicNotation.js'

console.log("Start of program");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Enter the filepath of the scratch project: ', fileName => {
    //console.log(`Hello, ${name}!`);
    readline.close();
  });

//const fileName = prompt("Enter the filepath of the scratch project: ", "");
var extension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || fileName;
//console.log(extension);
if(extension != 'sb3'){
    console.log("Incorrect File Extention: " + extension);
    process.exit(1);
}

processSb3File(fileName);
