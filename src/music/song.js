import  Note  from "./note.js";
import  Rest  from "./rest.js";
import  Chord  from "./chord.js";

export default class song{
    constructor(nodeList){
        this.processBranch = this.processBranch.bind(this);
        this.compareSong = this.compareSong.bind(this);
        this.music = [];
        this.nodeList = nodeList;
        this.curTime = 0;

        var headList = this.findHeadNodes(nodeList);
        //Need to find correct target
        headList.forEach(this.processBranch);
    }

    processBranch(node) {
        function findInsertionIndex(startTime, music){
            var i = music.length - 1;
            while(i > -1){
                if(startTime > music[i].startTime){
                    return i + 1;
                }
                i--;
            }
            return 0;
        }

        if(node.parent == null) this.curTime = 0;
        
        const opcode = node.opcode;
        
        //If it is a play note for beats
        if(opcode.startsWith("music_playNoteForBeats")){
            var noteLength = parseFloat(node.inputs.BEATS[1][1]);
            var noteMidi = this.findNode(node.inputs.NOTE[1]).fields.NOTE[0];
            const note = new Note(this.curTime, noteLength, noteMidi);
            for(let i = 0; i < this.music.length; i++){
                if(this.music[i].startTime == note.startTime){
                    if(this.music[i].type == "chord"){
                        this.music[i].addNote(note);
                        note.isUsed = false;
                        break;
                    }
                    else if(this.music[i].type == "note"){
                        const notes = [this.music[i], note];
                        const chord = new Chord(this.curTime, notes);
                        //Replace the note with the newly made chord
                        this.music.splice(findInsertionIndex(chord.startTime, this.music), 1, chord);
                        note.isUsed = false;
                        break;
                    }
                }
            }
            //Add note if it has a unique starting time
            if(note.isUsed) this.music.splice(findInsertionIndex(note.startTime, this.music), 0, note);
            this.curTime += noteLength;
        }
        //If the node is a rest, progress the time by the correct duration
        else if(opcode.startsWith("music_restForBeats")){
            var restLength = parseFloat(node.inputs.BEATS[1][1]);
            this.curTime += restLength*1;
        }
        
        //Check if node has child
        if(node.child != null){
            //If the node has a child, process that node
            var childNode = this.findNode(node.child);
            this.processBranch(childNode);
        }
    }

    findHeadNodes(nodeList){
        const headList = [];

        nodeList.forEach(node => {
            if(node.opcode.startsWith("event_whenflagclicked")){
                headList.push(node);
            }
        });
        return headList;
    }

    findNode(blockID){
        for(let i = 0; i < this.nodeList.length; i++){
            if(this.nodeList[i].blockID == blockID){
                return this.nodeList[i];
            }
        }
    }

    compareSong(otherSong){
        function compareNotes(note1, note2){
            //Check if the midi and the duration are equal
            if(!(note1.noteMidi == note2.noteMidi && note1.duration == note2.duration)){
                return false;
            }
            return true;
        }

        //TODO: Maybe give feedback in terms of start time, not index
        const feedback = [];
        
        var curSongIndex = 0;
        var curSongTime = this.music[0].startTime;
        var otherSongIndex = 0;
        var otherSongTime = otherSong.music[0].startTime;
        var curSongEnded = false;
        var otherSongEnded = false;

        //TODO: Check ending condition
        while(!curSongEnded || !otherSongEnded){
            console.log("Current Song Time: ", curSongTime);
            console.log("Other Song Time: ", otherSongTime);
            if(curSongTime == otherSongTime){
                //Check if elements are not the same type
                if(this.music[curSongIndex].type != otherSong.music[otherSongIndex].type){
                    feedback.push("1 ", otherSong.music[otherSongIndex].type, " expected at position ", curSongIndex);
                }
                //If both elements are notes
                else if(this.music[curSongIndex].type == "note"){
                    //Compare the notes
                    if(!compareNotes(this.music[curSongIndex], otherSong.music[otherSongIndex])){
                        //If the notes are not equivalent
                        feedback.push("2 Midi ", otherSong.music[otherSongIndex].noteMidi, " and duration ", 
                            otherSong.music[otherSongIndex].duration, " expected at position ", curSongIndex);
                    }
                }
                //If both elements are chords
                else if(this.music[curSongIndex].type == "chord"){
                    const chordCopy = [...this.music[curSongIndex].notes];
                    otherSong.music[otherSongIndex].notes.forEach(note => {
                        var isFound = false;
                        for(let i = 0; i < chordCopy.length; i++){
                            if(compareNotes(note, chordCopy[i])){
                                isFound = true;
                                chordCopy.splice(i, 1);
                                break;
                            }
                        }
                        if(!isFound){
                            feedback.push("3 Expected note with Midi value ", note.noteMidi, 
                                " and duration ", note.duration, " expected at position ", curSongIndex);
                        }
                    });
                    chordCopy.forEach(note => {
                        console.log(note);
                        feedback.push("4 Extra note with Midi value ", note.noteMidi, " and duration ", 
                            note.duration, " found at position ", curSongIndex);
                    });
                }
                //Increase indices of both songs
                if(this.music[curSongIndex + 1] != null){
                    curSongIndex++;
                    curSongTime = this.music[curSongIndex].startTime;
                }
                else{
                    curSongEnded = true;
                }
                
                if(otherSong.music[otherSongIndex + 1] != null){
                    otherSongIndex++;
                    otherSongTime = this.music[otherSongIndex].startTime;
                }
                else{
                    otherSongEnded = true;
                }
            }
            else if(otherSongTime < curSongTime){
                if(otherSongTime.music[otherSongIndex].type == "note"){
                    feedback.push("5 Expected note with Midi value ", otherSongTime.music[otherSongIndex].noteMidi, 
                        " and duration ", otherSongTime.music[otherSongIndex].duration, " at position ", otherSongIndex);
                }
                else if(otherSongTime.music[otherSongIndex].type == "chord"){
                    otherSongTime.music[otherSongIndex].notes.forEach(note => {
                        feedback.push("6 Expected note with Midi value ", note.noteMidi, " and duration ", 
                            note.duration, " found at position ", otherSongIndex);
                    });
                }
                //Increase index of only otherSong
                if(this.music[otherSongIndex + 1] != null){
                    otherSongIndex++;
                    otherSongTime = this.music[otherSongIndex].startTime;
                }
                else{
                    otherSongEnded = true;
                }
            }
            else if(otherSongTime > curSongTime){
                if(this.music[otherSongIndex].type == "note"){
                    feedback.push("7 Extra note with Midi value ", otherSongTime.music[otherSongIndex].noteMidi, 
                        " and duration ", otherSongTime.music[otherSongIndex].duration, " found at position ", otherSongIndex);
                }
                else if(this.music[otherSongIndex].type == "chord"){
                    this.music[otherSongIndex].notes.forEach(note => {
                        //console.log("Note: ", note);
                        feedback.push("8 Extra note with Midi value ", note.noteMidi, " and duration ", 
                            note.duration, " found at position ", otherSongIndex);
                    });
                }
                //Increase index of only this song
                if(this.music[curSongIndex + 1] != undefined){
                    curSongIndex++;
                    curSongTime = this.music[curSongIndex].startTime;
                }
                else{
                    curSongEnded = true;
                }
            }
        }
        /*
        if(feedback.length == 0){
            feedback.push("No Errors!")
        }
        */
       return feedback;
    }
}