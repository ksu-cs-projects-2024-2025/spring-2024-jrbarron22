import fs from 'fs/promises';
import { Project } from './objects/Project.js';
import { Target } from './objects/Target.js';
import { Block } from './objects/Block.js';
import { Node, AST} from './objects/ast.js';  

//as of now two places are calling buildAST(); 

export class Parser {
    constructor() {
        // No need to pass anything to the constructor if we're reading from a file
    }

    async parse(filePath) {
        console.log("parsing...");
        console.log(filePath);

        try {
            // Read the JSON data from the file
            const jsonData = await fs.readFile(filePath, 'utf-8');
            this.projectData = JSON.parse(jsonData);
            //await this.writeDebugDataToFile(this.projectData);
            // Create an AST with the root node
            const ast = this.buildAST(this.projectData);

            // Write the AST back to a JSON file, if needed
            await this.writeASTToFile(ast);

            // Return the AST
            return ast;
        } catch (err) {
            console.error('Error parsing the project data', err);
            throw err; // Re-throw the error so the caller can handle it
        }
    }


    buildAST(projectData) {
        const project = new Project();

        // Create the root node of the AST with the project data
        const rootNode = new Node('Project', project);

        projectData.targets.forEach(targetData => {
            const target = new Target(targetData);
            project.addTarget(target);

            const targetNode = new Node('Target', target);
            rootNode.addChild(targetNode);

            Object.values(targetData.blocks).forEach(blockData => {
                const block = new Block(blockData);
                target.addBlock(block);

                const blockNode = new Node('Block', block);
                targetNode.addChild(blockNode);
            });
        });

        // Create an AST with the root node
        return new AST(rootNode);
    }

    async writeASTToFile(ast) {
        try {
            // You might need a method to convert your AST to a JSON-serializable object
            const jsonString = JSON.stringify(ast.toJSON(), null, 2); // 'null' and '2' are used for formatting

            // Using promises to write to the file
            await fs.writeFile('output_ast.json', jsonString);
            console.log('Successfully wrote AST to file');
        } catch (err) {
            console.error('Error writing AST to file', err);
            throw err; // Re-throw the error so the caller can handle it
        }
    }

    async writeDebugDataToFile(data) {
        try {
            // Convert the data to a JSON string with formatting
            const jsonString = JSON.stringify(data, null, 2); // 'null' and '2' are used for formatting

            // Write the string to a text file
            await fs.writeFile('debug_projectData.txt', jsonString);
            console.log('Successfully wrote projectData to debug file');
        } catch (err) {
            console.error('Error writing projectData to debug file', err);
            // Not throwing an error here so that the main parse function can continue
        }
    }
}