export default class note{
    constructor(start_time, duration, pitch){
        this.start_time = start_time;
        this.duration = duration;
        this.pitch = pitch;
        this.type = "note";
        this.isUsed = true;
    }
}