export default class chord{
    constructor(startTime, notes){
        this.startTime = startTime;
        this.notes = notes;
        this.type = "chord";
    }

    addNote(note){
        this.notes.append(note);
    }
}