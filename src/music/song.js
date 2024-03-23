import { Note } from "./note.js";
import { Rest } from "./rest.js";
import { Chord } from "./chord.js";

export class song{
    constructor(ast){
        this.music = [];
        this.cur_time = 0;
        //Need to find correct target
        ast.root.children.forEach(target => target.children.forEach(processNode));
        //Do depth first where all notes and rests are added to one big data structure
        //Sort at the end
        this.sortMusicByStartTime();
    }

    processNode(node) {
        //Parse until all trees are finished
        const opcode = node.data.opcode;
        
        //Scratch library to look at stuff
        //github.com/llk/scratchvm
        //opcode syntax: music_whatevertheblockdoes
        
        //If it is a play note for beats, then figure out what note it is and add it the number of beats times
        if(opcode.startsWith("music_playNoteForBeats")){
            var note_length = node.data.input.beats[1][1];
            var note_pitch = node.children[0].data.fields.note[0];
            const note = new Note(this.cur_time, note_length, note_pitch);

            for(let i = 0; i < this.music.length; i++){
                if(this.music[i].start_time == note.start_time){
                    if(this.music[i].type == "chord"){
                        this.music[i].addNote(note);
                    }
                    else if(this.music[i].type == "rest" || this.music[i].type == "note"){
                        const notes = [this.music[i], note];
                        const chord = new Chord(this.cur_time, notes);
                        this.music.push(chord);
                        note.isUsed = false;
                    }
                }
            }
            if(note.isUsed) this.music.push(note);
            this.cur_time += note_length;
        }
        //Same for rests
        else if(opcode.startsWith("music_restForBeats")){
            var rest_length = node.data.input.beats[1][1];
            const rest = new Rest(rest_length);

            for(let i = 0; i < this.music.length; i++){
                if(this.music[i].start_time == rest.start_time){
                    if(this.music[i].type == "chord"){
                        this.music[i].addNote(rest);
                    }
                    else if(this.music[i].type == "rest" || this.music[i].type == "note"){
                        const notes = [this.music[i], rest];
                        const chord = new Chord(this.cur_time, notes);
                        this.music.push(chord);
                        rest.isUsed = false;
                    }
                }
            }
            if(rest.isUsed) this.music.push(rest);
            this.cur_time += rest_length;
        }
        
        //Reached the end of a target tree
        if(node.children.length < 1){
            this.cur_time = 0;
        } 
        node.children.forEach(child => processNode(child));
    }

    sortMusicByStartTime(){
        // Quick Sort algorithm taken from Geeks for Geeks
        // https://www.geeksforgeeks.org/quick-sort/
        // Function to partition the array and return the partition index
        function partition(arr, low, high) {
            // Choosing the pivot
            let pivot = arr[high].start_time;

            // Index of smaller element and indicates the right position of pivot found so far
            let i = low - 1;
        
            for (let j = low; j <= high - 1; j++) {
                // If current element is smaller than the pivot
                if (arr[j].start_time < pivot) {
                    // Increment index of smaller element
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
                }
            }
        
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Swap pivot to its correct position
            return i + 1; // Return the partition index
        }
        
        // The main function that implements QuickSort
        function quickSort(arr, low, high) {
            if (low < high) {
                // pi is the partitioning index, arr[pi] is now at the right place
                let pi = partition(arr, low, high);
        
                // Separately sort elements before partition and after partition
                quickSort(arr, low, pi - 1);
                quickSort(arr, pi + 1, high);
            }
        }
        quickSort(this.music, 0, this.music.length - 1);
    }
}