//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var formidable = require('formidable');
var multer = require("multer");
var fs = require("fs");
var app = express();

// Body Parser Middleware
app.use(bodyParser.json({limit:'50mb'}));

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
var server = app.listen(process.env.PORT || 10010, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//Initiallising connection string
var dbConfig = {
    user: "sa",
    password: "|user1314ADMIN|",
    server: "localhost",
    database: "DragoDB"
};

//Function to connect to database and execute query
var LoginUser = function (UserName,Password,res) {
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .input('UserName', sql.NVarChar,UserName)
            .input('Password',sql.NVarChar,Password)
            .output('Message', sql.VarChar(50))
            .execute('dbo.LoginUser', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}
var getallUsers=function(res){
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .query('SELECT TOP (100) [UserName],[FirstName],[LastName],[ContactNumber] FROM dbo.drago', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}
var SignUpUser=function (UserName,Password,FirstName,LastName,ContactNumber,res) {
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .input('UserName', sql.NVarChar,UserName)
            .input('Password',sql.NVarChar,Password)
            .input('FirstName',sql.NVarChar,FirstName)
            .input('LastName',sql.NVarChar,LastName)
            .input('ContactNumber',sql.NVarChar,ContactNumber)
            .output('Message', sql.VarChar(50))
            .execute('dbo.SignUpUser', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result.output.Message)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}

var AddPost=function(Title,Description,Post,Author,res){
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .input('Title', sql.VarChar(50),Title)
            .input('Post',sql.Text,Post)
            .input('Author',sql.NVarChar(20),Author)
            .input('Description',sql.NVarChar(100),Description)            
            .output('Message', sql.NVarChar(250))
            .execute('dbo.AddPost', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result.output.Message)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}
var getPost=function(PostID,res){
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .input('PostID', sql.Int,PostID)                   
            .execute('dbo.getPostWithID', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result.recordset[0].PostData)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}
var getAllPostShort=function(req,res){
    const pool = new sql.ConnectionPool(dbConfig, err => {
        // ... error checks
        if (err)
            console.log(err)
        // Stored Procedure
        pool.request()
            .execute('dbo.getAllPostsShort', (err, result) => {
                // ... error checks
                if (err)
                    console.log(err)
                res.send(result)
                pool.close();
            })
    })

    pool.on('error', err => {
        // ... error handler
        if (err)
        console.log(err)
    })
}
fileupload=function(req,res){
console.log("Called");
    console.log(req.files);
}

app.post('/api/login',function(req,res){
    LoginUser(req.body.UserName,req.body.Password,res);
})
app.post('/api/SignUp',function(req,res){
SignUpUser(req.body.UserName,req.body.Password,req.body.FirstName,req.body.LastName,req.body.ContactNumber,res);
})
app.get('/api/getUsers',function(req,res){
    getallUsers(res);
})

app.post('/api/file',function(req,res,next){
    var form=formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      res.send(files);
      });
})
app.post("/upload", multer({dest: "./uploads/"}).array("uploads", 12), function(req, res) {
    var fileInfo = [];
    for(var i = 0; i < req.files.length; i++) {
        fileInfo.push({
            "originalName": req.files[i].originalName,
            "size": req.files[i].size,
            "b64": new Buffer(fs.readFileSync(req.files[i].path)).toString("base64")
        });
        fs.unlink(req.files[i].path);
    }
    console.log(fileInfo);
    res.send(fileInfo);
});
app.post("/api/addPost",function(req,res){
    AddPost(req.body.Title,req.body.Description,req.body.Post,req.body.Author,res);
})

app.get("/api/getPost/:ID",function(req,res){
    getPost(req.params.ID,res);
})

app.get("/api/getallposts",function(req,res){
    getAllPostShort(req,res);
})