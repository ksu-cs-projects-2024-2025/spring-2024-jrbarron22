#!/usr/bin/env node

export function orphanSort(ast) {
    const orphans = [];
    const nonOrphans = [];

    function processNode(node) {
        if (node.type !== 'Block') return;

        const opcode = node.data.opcode;
        const parent = node.data.parent;

        if (parent === null) {
            if (isStartingBlock(opcode)) {
                nonOrphans.push(node);
            } else {
                orphans.push(node);
            }
        }

        node.children.forEach(child => processNode(child));
    }

    //Josh: tweak this later to not hard code the hat blocks
    function isStartingBlock(opcode) {
        return ['event_whenflagclicked', 'event_whenkeypressed', 'event_whenstageclicked', 
                'event_whenbackdropswitchesto', 'event_whengreaterthan', 'event_whenbroadcastreceived']
               .includes(opcode);
    }

    console.log("Start of orphan sort");
    // Traverse the AST from the root
    ast.root.children.forEach(target => target.children.forEach(processNode));

    console.log("nonorphans: ", nonOrphans);
    console.log("orphans: ", orphans);

    return [orphans, nonOrphans];
}
