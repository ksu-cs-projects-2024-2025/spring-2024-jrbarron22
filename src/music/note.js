export default class note{
    constructor(startTime, duration, pitch){
        this.startTime = startTime;
        this.duration = duration;
        this.pitch = pitch;
        this.type = "note";
        this.isUsed = true;
    }
}