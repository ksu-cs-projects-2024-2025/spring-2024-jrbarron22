const Note = require("./note.js");
const Chord = require("./chord.js");

class song{
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

        ///
        //feedback is the array of feedback
        //element is the note or chord
        //type is which type of feedback to push
        ///
        function pushFeedback(feedback, element, type){
            //console.log(element);
            switch(type){
                //Wrong element type
                case 1:
                    feedback.push(element.type.concat(" expected at start time ", element.startTime));
                    break;
                //Incorrect note data
                case 2:
                    feedback.push("Expected note with Midi value: ".concat(element.noteMidi, " and duration: ", 
                            element.duration, " expected at start time ", element.startTime));
                    break;
                //Extra note found
                case 3:
                    feedback.push("Extra note with Midi value ".concat(element.noteMidi, " and duration ", 
                            element.duration, " found at start time ", element.startTime));
                    break;
            }
        }

        //console.log(this.music);
        //console.log(this.music.length);
        //console.log(otherSong.music);

        //TODO: Maybe give feedback in terms of start time, not index
        const feedback = [];
        
        var curSongIndex = 0;
        var curSongTime = this.music[0].startTime;
        var otherSongIndex = 0;
        var otherSongTime = otherSong.music[0].startTime;
        var curSongEnded = false;
        var otherSongEnded = false;

        //TODO: Check ending condition
        while(!curSongEnded && !otherSongEnded){
            if(curSongTime == otherSongTime){
                //console.log("Same Song Time");
                //Check if elements are not the same type
                if(this.music[curSongIndex].type != otherSong.music[otherSongIndex].type){
                    pushFeedback(feedback, otherSong.music[otherSongIndex], 1);
                }
                //If both elements are notes
                else if(this.music[curSongIndex].type == "note"){
                    //console.log("Both Notes");
                    //Compare the notes
                    if(!compareNotes(this.music[curSongIndex], otherSong.music[otherSongIndex])){
                        //If the notes are not equivalent
                        pushFeedback(feedback, otherSong.music[otherSongIndex], 2);
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
                            pushFeedback(feedback, note, 2);
                        }
                    });
                    chordCopy.forEach(note => {
                        //console.log(note);
                        pushFeedback(feedback, note, 3);
                    });
                }

                //Increase indices of both songs
                if(this.music[curSongIndex + 1] != undefined){
                    curSongIndex++;
                    curSongTime = this.music[curSongIndex].startTime;
                }
                else{
                    curSongEnded = true;
                }
                
                if(otherSong.music[otherSongIndex + 1] != undefined){
                    otherSongIndex++;
                    otherSongTime = otherSong.music[otherSongIndex].startTime;
                }
                else{
                    otherSongEnded = true;
                }
            }
            else if(otherSongTime < curSongTime){
                //console.log(otherSong.music[otherSongIndex].type);
                if(otherSong.music[otherSongIndex].type == "note"){
                    pushFeedback(feedback, otherSong.music[otherSongIndex], 2);
                }
                else if(otherSong.music[otherSongIndex].type == "chord"){
                    otherSong.music[otherSongIndex].notes.forEach(note => {
                        pushFeedback(feedback, note, 2);
                    });
                }
                //Increase index of only otherSong
                if(otherSong.music[otherSongIndex + 1] != undefined){
                    otherSongIndex++;
                    otherSongTime = otherSong.music[otherSongIndex].startTime;
                }
                else{
                    otherSongEnded = true;
                }
            }
            else if(otherSongTime > curSongTime){
                //console.log(curSongTime);
                if(this.music[otherSongIndex].type == "note"){
                    pushFeedback(feedback, this.music[curSongIndex], 3);
                }
                else if(this.music[curSongIndex].type == "chord"){
                    this.music[curSongIndex].notes.forEach(note => {
                        //console.log("Note: ", note);
                        pushFeedback(feedback, note, 3);
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

        while(!otherSongEnded){
            //If element is a note
            if(otherSong.music[otherSongIndex].type == "note"){
                pushFeedback(feedback, otherSong.music[otherSongIndex], 2);
            }
            //If element is a chord
            else if(otherSong.music[otherSongIndex].type == "chord"){
                otherSong.music[otherSongIndex].notes.forEach(note => {
                    pushFeedback(feedback, note, 2);
                });
            }
            
            //Iterate
            if(otherSong.music[otherSongIndex + 1] != undefined){
                otherSongIndex++;
                otherSongTime = otherSong.music[otherSongIndex].startTime;
            }
            else{
                otherSongEnded = true;
            }
        }
        while(!curSongEnded){
            //If element is a note
            if(this.music[curSongIndex].type == "note"){
                pushFeedback(feedback, this.music[curSongIndex], 3);
            }
            //If element is a chord
            else if(this.music[curSongIndex].type == "chord"){
                this.music[curSongIndex].notes.forEach(note => {
                    pushFeedback(feedback, note, 3);
                });
            }

            //Iterate
            if(this.music[curSongIndex + 1] != undefined){
                curSongIndex++;
                curSongTime = this.music[curSongIndex].startTime;
            }
            else{
                curSongEnded = true;
            }
        }
        if(feedback.length == 0){
            feedback.push("No Errors! Great Job!");
        }
       return feedback;
    }
}

module.exports = song;