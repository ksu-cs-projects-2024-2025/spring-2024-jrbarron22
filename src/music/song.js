import { Note } from "./note.js";
import { Rest } from "./rest.js";

class song{
    music = [];
    constructor(ast){
        ast.root.children.forEach(target => target.children.forEach(processNode));
    }

    processNode(node) {
        if (node.type !== 'Block') return;

        const opcode = node.data.opcode;
        
        //Scratch library to look at stuff
        //github.com/llk/scratchvm
        //opcode syntax: music_whatevertheblockdoes
        
        //If it is a play note for beats, then figure out what note it is and add it the number of beats times
        if(opcode.startsWith("music_playNoteForBeats")){
            var note_length = node.data.input.beats[1][1];
            var note_pitch = node.children[0].data.fields.note[0];
            const note = new Note(note_length, note_pitch);
            this.music.push(note);
        }
        //Same for rests
        else if(opcode.startsWith("music_restForBeats")){
            var rest_length = node.data.input.beats[1][1];
            const rest = new Rest(rest_length);
            this.music.push(rest);
        }

        node.children.forEach(child => processNode(child));
    }
}