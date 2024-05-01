import fs from 'fs/promises';
import { unzipSb3 } from '../src/utils/sb3Unzipp.js';

export default class Parser{
    constructor(){}

    async parse(fileName){
        var nodeList = [];

        const unzippedSb3 = await unzipSb3(fileName);
        var jsonData = await fs.readFile(unzippedSb3, 'utf-8');
        var projectData = JSON.parse(jsonData);

        //console.log(projectData);

        projectData.targets.forEach(target => {
            var keys = Object.keys(target.blocks);
            //console.log(keys);
            for(let i = 0; i < keys.length; i++){
                //console.log(target.blocks[keys[i]]);
                var blockID = keys[i];
                var parent = target.blocks[keys[i]].parent;
                var child = target.blocks[keys[i]].next;
                var opcode = target.blocks[keys[i]].opcode;
                var inputs = target.blocks[keys[i]].inputs;
                var fields = target.blocks[keys[i]].fields;
                //console.log(inputs);
                var newNode = new Node(blockID, parent, child, opcode, inputs, fields);
                //console.log(newNode);
                nodeList.push(newNode);
            }
        });

        //console.log(nodeList);
        return nodeList;
    }
}

class Node{
    constructor(blockID, parent, child, opcode, inputs, fields){
        this.blockID = blockID;
        this.parent = parent;
        this.child = child;
        this.opcode = opcode;
        this.inputs = inputs;
        this.fields = fields;
    }
}