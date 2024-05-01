class note{
    constructor(startTime, duration, pitch){
        this.startTime = startTime;
        this.duration = duration;
        this.noteMidi = pitch;
        this.type = "note";
        this.isUsed = true;
    }
}

module.exports = note;