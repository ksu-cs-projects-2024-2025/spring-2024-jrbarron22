"use strict";
const JSZip = require('jszip');
const fs = require('fs-extra');
var AdmZip = require("adm-zip");
const extract = require('extract-zip');

async function unzipSb3(filePath, outputDir = './unzippedSb3') {
    // Load the .sb3 file
    //const data = await fs.readFile(filePath);
    //console.log(filePath);
    
    // Load the .sb3 content with JSZip
    //const zip = new JSZip();
    const zip = new AdmZip(filePath);
    //const contents = await zip.loadAsync(data);
    
    // Ensure the output directory exists
    //await fs.ensureDir(outputDir);

    // Extract each file in the zip
    /*
    for (const [relativePath, fileEntry] of Object.entries(contents.files)) {
        if (!fileEntry.dir) { // Ensure it's a file and not a directory
            const content = await fileEntry.async('nodebuffer');
            await fs.writeFile(`${outputDir}/${relativePath}`, content);
        } else {
            await fs.ensureDir(`${outputDir}/${relativePath}`);
        }
    }
    */
   zip.extractAllTo(outputDir, true);

    //console.log("Unzipping completed!");
    return `${outputDir}/project.json`; // return the path of the unzipped project.json file
}

async function unzipSb3Data(data, outputDir = './unzippedSb3') {
    // Load the .sb3 content with JSZip
    const zip = new JSZip();
    const contents = await zip.loadAsync(data);

    // Ensure the output directory exists
    await fs.ensureDir(outputDir);

    // Extract each file in the zip
    for (const [relativePath, fileEntry] of Object.entries(contents.files)) {
        if (!fileEntry.dir) { // Ensure it's a file and not a directory
            const content = await fileEntry.async('nodebuffer');
            await fs.writeFile(`${outputDir}/${relativePath}`, content);
        } else {
            await fs.ensureDir(`${outputDir}/${relativePath}`);
        }
    }

    //console.log("Unzipping completed!");
    return `${outputDir}/project.json`; // return the path of the unzipped project.json file
}

module.exports = unzipSb3;