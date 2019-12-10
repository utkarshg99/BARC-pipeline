new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        dialog: false,
        fname: "",
        mname: "",
        lname: "",
        age: 0,
        email: ""
    }),
    mounted() {
        if(userJSON.status=="newUser")
            this.dialog=true;
    },
    methods: {
        storeData(){
            userJSON.fname=this.fname;
            userJSON.lname=this.lname;
            userJSON.mname=this.mname;
            userJSON.age=this.age;
            userJSON.email=this.email;
            userJSON.status="getData";
            userJSON.filename=userJSON.fname+userJSON.mname+userJSON.lname+"0";
            ipc.sendSync("syncSetUserData", userJSON);
            this.dialog=false;
        }
    }
})