new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        dialog: false,
        fname: "",
        mname: "",
        lname: "",
        age: 0,
        email: "",
        gender: "",
        accept: false,
        alertForAccept: false
    }),
    methods: {
        storeData(){
            userJSON.fname=this.fname;
            userJSON.lname=this.lname;
            userJSON.mname=this.mname;
            userJSON.age=this.age;
            userJSON.email=this.email;
            userJSON.gender=this.gender;
            userJSON.status="getData";
            userJSON.filename=userJSON.fname+userJSON.mname+userJSON.lname+"0";
            ipc.sendSync("syncSetUserData", userJSON);
            this.dialog=false;
        },
        launchModal(){
            if(userJSON.status=="newUser" && this.accept)
                this.dialog=true;
            else if(!this.accept){
                this.alertForAccept=true;
                setTimeout(this.removeError, 5000);
            }
        },
        removeError(){
            this.alertForAccept=false;
        }
    }
})