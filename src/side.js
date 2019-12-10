let mongoose = require('mongoose');
const USER = require('./student.js')
const MEETING = require('./meeting.js')
const RECRUITMENTS = require('./recruitments.js')
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let axios = require('axios')
let querystring = require('querystring')
let cheerio = require('cheerio')
let cors = require('cors')

let app = express()
app.use(cors())
let router = express.Router()
app.use(bodyParser.json({
    type: 'application/json'
}))
let options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}

function retdata(rollno) {
    var options = {
        headers: {
            Cookie: 'JSESSIONID=C0C342B0BD442F204C220FB5088E1542.worker4',
            Referer: 'https://oa.cc.iitk.ac.in/Oa/Jsp/OAServices/IITk_SrchRes_new.jsp?sbm=Y',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    let fr={
        typ: 'stud',
        bk: '',
        numtxt: ''+rollno
    }
    var x = axios.post("https://oa.cc.iitk.ac.in/Oa/Jsp/OAServices/IITk_SrchRes_new.jsp?sbm=Y", querystring.stringify(fr), options)
    return x;
}

function setbuild(objs, rollno){
    let retobj = {
        name : "",
        username : "",
        rollno : rollno,
        status: true
    }
    retobj.name = objs[0].value
    retobj.username = objs[4].value
    if(retobj.name.trim()=='')
        retobj.status=false
    if(retobj.username.trim()=='')
        retobj.status=false
    return(retobj)
}

function createUsers(userdata) {
    let promise = new Promise((resolve, reject) => {
        let newuser = new USER({
            _id: new mongoose.Types.ObjectId(),
            username: userdata.username,
            name: userdata.name,
            rollno: userdata.rollno
        })
        newuser.save((err) => {
            if (err) {
                console.log(err)
                reject()
            }
            let respbody = {
                'status': 'successful',
                'dbid': newuser._id
            }
            resolve(respbody)
        })
    })
    return promise
}

function cleanse(userdata) {
    if (typeof userdata.username == 'undefined' || userdata.username.length<4) {
        console.log(userdata)
        return false
    }
    if (typeof userdata.name == 'undefined') {
        console.log(userdata)
        return false
    }
    if (typeof userdata.rollno == 'undefined') {
        console.log(userdata)
        return false
    }
    return true
}

function checkExistence(userdata) {
    var rollno = userdata.rollno;
    var k = {};
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = USER.find({
            'rollno': rollno
        }, function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                k.status = true;
                resolve(k);
            } else {
                k.status = false;
                k.reason = "Roll Number already Registered."
                resolve(k);
            }
        });
    });
    return promiseforcheck;
}

function getroll(rollno){
    var rollno = rollno;
    var k = {};
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = USER.find({
            'rollno': rollno
        }, function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                k.status = false;
                resolve(k);
            } else {
                k=docs[0]
                k={
                    "username":k.username,
                    "name":k.name,
                    "rollno":k.rollno,
                    "points":k.points
                }
                k.status = true;
                resolve(k);
            }
        });
    });
    return promiseforcheck;
}

function updateniggas(data){
    var conditions = {rollno: data.rollno}
    var update = {$inc : { points: data.points }}
    var opts = {multi : true}
    var prom = new Promise((resolve, reject) => {
        USER.update(conditions, update, opts, function(err, numAffected){
            resolve();
        })
    })
    return prom
}

function geteveryone(bypass){
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = USER.find({}).sort({points: -1}).exec(function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                k.status = false;
                resolve(k);
            } else {
                let kn=[]
                docs.forEach((doc)=>{
                    let k={
                        "username":doc.username,
                        "name":doc.name,
                        "rollno":doc.rollno,
                        "points":doc.points
                    }
                    if(k.points!=0 || bypass)
                        kn.push(k)
                });
                resolve(kn);
            }
        });
    });
    return promiseforcheck;
}

function getmeetingdata(){
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = MEETING.find({}).exec(function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                let k={}
                k.status = false;
                resolve(k);
            } else {
                let kn=[]
                docs.forEach((doc)=>{
                    let k={
                        "title":doc.title,
                        "docs":doc.docs,
                        "link":doc.link,
                        "pres":doc.pres,
                        "date":doc.date,
                        "agenda":doc.agenda
                    }
                    kn.unshift(k)
                });
                resolve(kn);
            }
        });
    });
    return promiseforcheck;
}

function addnewmeeting(data){
    let promise = new Promise((resolve, reject) => {
        let newuser = new MEETING({
            _id: new mongoose.Types.ObjectId(),
            title: data.title,
            docs: data.docs,
            link: data.link,
            pres: data.pres,
            agenda: data.agenda,
            date: data.date
        })
        newuser.save((err) => {
            if (err) {
                reject()
            }
            resolve()
        })
    })
    return promise
}

function createRecruitment(data){
    let promise = new Promise((resolve, reject) => {
        let newuser = new RECRUITMENTS({
            _id: new mongoose.Types.ObjectId(),
            status: data.status,
            issue: data.issue,
            id: data.id,
            title: data.title
        })
        newuser.save((err) => {
            if (err) {
                console.log(err)
                reject()
            }
            let respbody = {
                'status': 'successful',
                'dbid': newuser._id
            }
            resolve(respbody)
        })
    })
    return promise
}

function updaterecruitmentforms(data){
    var conditions = {id: data.url}
    var update = {$set : { status: data.status }}
    var opts = {multi : true}
    var prom = new Promise((resolve, reject) => {
        RECRUITMENTS.update(conditions, update, opts, function(err, numAffected){
            resolve();
        })
    })
    return prom
}

function getavailablerecruitments(){
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = RECRUITMENTS.find({}).exec(function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                let k={}
                k.status = false;
                resolve(k);
            } else {
                let kn=[]
                docs.forEach((doc)=>{
                    let k={
                        "id":doc.id,
                        "title":doc.title,
                        "issue":doc.issue,
                        "status":doc.status
                    }
                    kn.unshift(k)
                });
                resolve(kn);
            }
        });
    });
    return promiseforcheck;
}

router.get('/get/:rollno', (req, res) => {
    let data = getroll(req.params.rollno);
    data.then((data)=>{
        res.json(data);
        res.end();
    })
});

router.get('/getall', (req, res) => {
    let fulldata = geteveryone(false);
    fulldata.then((data) => {
        res.json(data);
        res.end();
    })
})

router.get('/getmeetingdata', (req, res) => {
    let fulldata = getmeetingdata();
    fulldata.then((data) => {
        res.json(data);
        res.end();
    })
})

router.get('/getallasadmin', (req, res) => {
    let fulldata = geteveryone(true);
    fulldata.then((data) => {
        res.json(data);
        res.end();
    })
})

router.get('/recruit/available', (req, res) => {
    let prom = getavailablerecruitments();
    prom.then((k) => {
        res.json({
            data: k
        });
        res.end();    
    })
})

router.post('/register', (req, res) => {
    if ((req.body.xpass == "86582bd8e94a3dc22824ac7a16141ea75f141c2a2d98178581e4a15cad591aa7")){
        retdata(req.body.rollno).then((resp) => {
            let body = resp.data
            const $ = cheerio.load(body);
            let build =[]
            $('.TableContent').children().each(function(i, e){
                if(i>4 && i!=9){
                    let r = $(this).html().trim()
                    r=r.replace(/\t/g, '').split('\n')
                    //at this point variable r has some more info that we don't need right now
                    r={
                        tagname:r[0],
                        value:r[1]
                    }
                    build.push(r)
                }
                else if(i==9){
                    let r = $(this).html().trim()
                    r=r.replace(/\t/g, '').split('\n')[0]
                    r={
                        tagname: "username",
                        value: r.substring(r.indexOf('to:')+3,r.indexOf("@"))
                    }
                    build.push(r)
                }
            })
            let data=setbuild(build, req.body.rollno)
            if (cleanse(data)) {
                var preprom = checkExistence(req.body)
                preprom.then((k) => {
                    if (k.status) {
                        let prom = createUsers(data)
                        prom.then((respbody) => {
                            res.json(respbody)
                            res.statusCode = 201
                            res.end()
                        })
                        prom.catch(() => {
                            // console.log("bhakbc")
                            res.statusCode = 400
                            res.end()
                        })
                    } else {
                        res.statusCode = 403
                        let x = {
                            'Reason': "Username already in use."
                        }
                        res.json(x)
                        res.end()
                    }
                })
                preprom.catch((k) => {
                    res.statusCode = 403
                    res.json(k)
                    res.end()
                })
            }
            else {
                res.statusCode = 400
                // console.log("jaabey")
                res.end()
            }
        }).catch((err)=>{
            console.log(err)
        })
    }
    else {
        // console.log("chalbhsdk")
        res.statusCode = 400
        res.end()
    }
})

router.post('/updateniggas', (req, res) => {
    if ((req.body.xpass == "86582bd8e94a3dc22824ac7a16141ea75f141c2a2d98178581e4a15cad591aa7")){
        let data = req.body.data
        let proms = []
        console.log(data)
        for(var o=0; o<data.length; o++){
            proms.push(updateniggas(data[o]))
        }
        Promise.all(proms).then(()=>{
            res.json({
                status:true
            });
            res.end();
        }).catch(()=>{
            res.json({
                status:false
            });
            res.end();
        })
    }
    else{
        res.json({
            status:false
        })
        res.end()
    }
})

router.post('/addnewmeeting', (req, res) => {
    let data=req.body
    if(data.xpass=='86582bd8e94a3dc22824ac7a16141ea75f141c2a2d98178581e4a15cad591aa7'){
        let prom = addnewmeeting(data)
        prom.then(()=>{
            res.json({
                message: "Success"
            })
            res.end();
        }).catch((err)=>{
            res.json({
                message: "Failed",
                msg2: err
            })
            res.end();
        })
    }
    else{
        res.json({
            message: "Wrong Password"
        })
        res.end();
    }
})

router.post('/recruit/updatedata', (req, res) => {
    let data = req.body;
    let gd = [];
    for(var i=0; i < data.length; i++){
        gd.push(updaterecruitmentforms(data[i]));
    }
    Promise.all(gd).then(() => {
        res.json({
            "status": "Success"
        });
        res.end();
    }).catch((err) => {
        res.json({
            "status": "Failure"
        });
        res.end();
    })
})

router.post('/recruit/newform', (req, res) => {
    createRecruitment(req.body).then((k) => {
        res.json(k);
        res.end();
    });
})

// var url = 'mongodb://127.0.0.1:27017/snt'
var url = "mongodb+srv://utkarsh:9044682600@heroku-ia22v.mongodb.net/snt?retryWrites=true&w=majority";
var port = 8080
port = process.env.PORT
if (port == null || port == "") {
  port = 8080
}
mongoose.connect(url, options, function (err) {
    app.use('/', router)
    app.listen(port)
    console.log("Connected and waiting at port = "+port);
})