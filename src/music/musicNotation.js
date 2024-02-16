class note{
    constructor(startTime, duration, pitch){
        this.startTime = startTime;
        this.duration = duration;
        this.pitch = pitch;
    }
}

class rest{
    constructor(startTime, duration){
        this.startTime = startTime;
        this.duration = duration;
    }
}

class chord{
    constructor(startTime, duration, notes){
        this.startTime = startTime;
        this.duration = duration;
        this.notes = notes;
    }
}