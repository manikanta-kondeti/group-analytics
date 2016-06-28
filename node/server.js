//Lets require/import the HTTP module
var http = require('http');

var express = require('express');
var jsonfile = require('jsonfile');
var app = express();
fs = require('fs');
var formidable = require("formidable");
var util = require('util')
// node doesn't have xml parsing or a dom. use jsdom
jsdom = require('jsdom').jsdom;
var multer = require('multer');
var ejs = require('ejs');
/*
app.get('/', function (req, res) {
   res.send('Hello World using express dasdas');
})
*/
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

app.use(express.static('assets'));
app.use(express.static('uploads'));
app.use('/assets', express.static('assets'));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


var upload = multer({ storage : storage });

app.post('/upload_data', function (request, response) {
	
	var form = new formidable.IncomingForm();
	response.writeHead(200, {'Content-Type': 'text/html'});
    form.parse(request, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        
        var data = JSON.parse(fields.data);
        console.log("received json data" + data);
        fs.writeFile("./data/" + data.name + ".json", JSON.stringify(data), function (err) {
		  if (err) return console.log(err);
		  console.log('File has been writeen in here = ' + "./data/" + data.name + ".json");
		});
        
		var content = fs.readFileSync('./views/canvas.html', 'utf-8');
		var compiled = ejs.compile(content);
		var first_user_messages = [], second_user_messages = [], third_user_messages = [];
		var first_user_names = data.first_user_names;
		var second_user_names = data.second_user_names;	
		console.log(data.first_user_names);
		for (var i=0;i<data.conversations.length; i++) {
			first_user_messages.push(Math.round( (parseInt(data.first_user_contribution[i])/100) * parseInt(data.conversations[i])));
			second_user_messages.push(Math.round( (parseInt(data.second_user_contribution[i])/100) * parseInt(data.conversations[i])));
			third_user_messages.push(Math.round( (parseInt(data.third_user_contribution[i])/100) * parseInt(data.conversations[i])));
		}

		// Send params - conversations, active_members, 
		var ejs_params_to_html = {};
		ejs_params_to_html['conversations'] = data.conversations;
		ejs_params_to_html['active_members'] = data.active_members;
		ejs_params_to_html['total_members'] = data.total_members;
		ejs_params_to_html['conversations_per_week'] = data.avg_conversations_per_week;
		ejs_params_to_html['conversations_per_month'] = data.avg_conversations_per_month;
		ejs_params_to_html['first_user_messages'] = first_user_messages;
		ejs_params_to_html['second_user_messages'] = second_user_messages;
		ejs_params_to_html['third_user_messages'] = third_user_messages;
		ejs_params_to_html['first_user_names'] = first_user_names;
		ejs_params_to_html['second_user_names'] = second_user_names;
		ejs_params_to_html['username'] = data.name.split("_")[0];
		ejs_params_to_html['groupname'] = data.name.split("_")[1];

        // Send params to html using ejs
        var renderedHtml = ejs.render(content, ejs_params_to_html);  //get redered HTML code
    	response.end(renderedHtml);
       	
    });	
});


app.get('/upload', function (request, response) {
	response.render('input.html');
	response.end("Graph path called, I am working..!");
});


var server = app.listen(8090, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
});