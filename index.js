// Express
const express = require('express');

// Discord
const Discord = require('discord.js');
const client = new Discord.Client();

// File System
const fs = require('fs');

var config = JSON.parse(fs.readFileSync(__dirname+'/config.json', 'utf-8'));

// Discord js

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.author.bot) return;

	if (msg.content.charAt(0) === config['cmdprefix']) {
		config['chats'].forEach(element => {
			if(msg.content.includes(element['cmd'])){
				msg.reply("\n" + element['res']);
				console.log("Sent: '" + element['res'] + "' to User: " + msg.author.username)
			}
		});
	}
});

client.login(config['api-token']);

// Web interface

var bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true })); 

var interface = fs.readFileSync(__dirname + '/index.html', 'utf-8');

function clearInterface(){
	interface = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

function updateConfig(data, res){
	// Sets data in config
	config['api-token'] = data['apitoken'];
	config['cmdprefix'] = data['prefix'];

	var tempConfig = config;
	tempConfig['chats'] = [];
	var tempChats = JSON.parse(data['chats']);
	for(var i = 0; i < tempChats['cmd'].length; i++){
		tempConfig['chats'].push({
			cmd : tempChats['cmd'][i].replace(/<div>/g,'').replace('</div>',''),
			res : tempChats['res'][i].replace(/<div>/g,'').replace('</div>','')
		});
	}
	config = tempConfig;
	//config['chats'] = chatsOut;

	// Writes config to the config file
    fs.writeFile(__dirname + '/config.json', JSON.stringify(config, null, '\t'), 'utf8', function (err) {
        if (err) return console.log(err);
	});
	
	// Sets up interface to show data from config
	interface = interface.replace('***', config['api-token']);

	var cmdDisp = "";

	for (var i = 0; i < config['chats'].length; i++) {
		cmdDisp += '<tr>';
		cmdDisp += '<td>' + i.toString() + '</td>';
		cmdDisp += '<td contenteditable="true">' + config['chats'][i]['cmd'] + '</td>';
		cmdDisp += '<td contenteditable="true">' + config['chats'][i]['res'] + '</td>';
		cmdDisp += '</tr>';
	};

	interface = interface.replace('!!!', cmdDisp);
	interface = interface.replace('&&&', config['cmdprefix']);

    res.send(interface);
    console.log('Updated Configuration');
}

app.get('/', (req, res) => {
    clearInterface();
	interface = interface.replace('***', config['api-token']);

	// Replace !!! with Command List
	var cmdDisp = "";

	for (var i = 0; i < config['chats'].length; i++) {
		cmdDisp += '<tr>';
		cmdDisp += '<td>' + i.toString() + '</td>';
		cmdDisp += '<td contenteditable="true">' + config['chats'][i]['cmd'] + '</td>';
		cmdDisp += '<td contenteditable="true">' + config['chats'][i]['res'] + '</td>';
		cmdDisp += '</tr>';
	};

	interface = interface.replace('!!!', cmdDisp);
	interface = interface.replace('&&&', config['cmdprefix']);

	// Send Page
    res.send(interface);
});

app.post('/update', (req, res) => {
    clearInterface();
    updateConfig(req.body, res);
});

app.listen(port, () => console.log(`Open the config url by ctrl clicking it in the terminal http://localhost:${port}`));