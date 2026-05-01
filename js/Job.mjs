class Job{
    constructor(data){
        this.id = data.id;
        this.company = data.company;
        this.logo = data.logo;
        this.new = data.new;
        this.featured = data.featured;
        this.position = data.position;
        this.postedAt = data.postedAt;
        this.contract = data.contract;
        this.location = data.location;
        this.tags = [data.role, data.level, ...data.languages, ...data.tools];
        
    }
}
export {Job};
