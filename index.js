const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var path = require('path');
const port = process.env.PORT || 5000;
var fs = require('fs');
const funcs = require('./server_source/functions.js');
const rolling = require('./server_source/dice_rolling.js');
const files = require('./server_source/file_handling.js');
const map_folder = "./public/maps/";
const assets_folder = "./public/avatars/";
const character_folder = "character_sheets";

const EMPHASIZE_TIMEOUT = 5000;


var current_map = ""
var rolling_base = "";
var isInitiativeScriptWorking = false;
var savedInitiativeRolls = [];

var lines = [];
const MAX_NUMBER_OF_LINES = 30;

var coordinates = [];
var charactersIds = 0;


var initiative_box = [];



var chat_messages = [];

const users = {};
var loaded_data;
var loadedDone = false;
var current_player = "";
var emphasizing = false;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {

  socket.emit('give_me_name');
  socket.emit('start_messages', chat_messages);
  socket.emit('start_init', initiative_box);
 

  socket.on('new-user', name => {
    socket.emit('change-the-map', current_map);
    socket.emit('new-base', rolling_base);
    users[socket.id] = name;
    new_user_message = " joined.";
    chat_messages = funcs.chat_handling(new_user_message, chat_messages, users[socket.id], "msg");
    socket.emit('chat-mesage', chat_messages);
    socket.broadcast.emit('chat-mesage', chat_messages);
  })
    
    socket.emit('coords', coordinates);
    

   socket.on('synchronize', () =>{
      socket.emit('coords', coordinates);
      socket.broadcast.emit('coords', coordinates);
   })
  
    socket.on('send-chat-message', message => {
      chat_messages = funcs.chat_handling(message, chat_messages, users[socket.id], "msg");
      saveCurrentState();
      socket.emit('chat-mesage', chat_messages);
      socket.broadcast.emit('chat-mesage', chat_messages);
    })

    socket.on('base', new_base => {
      rolling_base = new_base;
      saveCurrentState();
      socket.emit('new-base', rolling_base);
      socket.broadcast.emit('new-base', rolling_base);
    })

    socket.on('move-character', ([x, y, id]) => {
      coordinates = coordinates.map(item => {
        if (item.id == id) {
          return item = {x: x, y:y, id: item.id, graphic: item.graphic, sizeMultiplier: item.sizeMultiplier};
        }
        return item = {...item};
      }) 
      saveCurrentState();
      socket.broadcast.emit('move-order', [x, y, id]);
    })

    socket.on('loadedResponse', loadedData => {
      current_map = loadedData.map;
      rolling_base = loadedData.base;
      initiative_box = loadedData.ini;
      coordinates = loadedData.chars;
      socket.broadcast.emit('loadedDone', loadedData);
    })

    socket.on('disconnect', () =>{
      if (typeof users[socket.id] != 'string') return;

      disconnected_message = " disconnected.";
      chat_messages = funcs.chat_handling(disconnected_message, chat_messages, users[socket.id], "msg");
      socket.broadcast.emit('chat-mesage', chat_messages);
      delete users[socket.id];
     // chat_messages = funcs.chat_handling(disconnected_message, chat_messages, MAX_NUMBER_OF_CHAT_MESSAGES);
     // socket.broadcast.emit('chat-mesage', chat_messages);
    })

    socket.on('new-map', map_texture => {
      const map_url = funcs.getGraphicURL(map_texture);
      current_map = map_url;
      saveCurrentState();
      socket.emit('change-the-map', map_url);
      socket.broadcast.emit('change-the-map', map_url);
    })

    socket.on('new_champ', champion =>{
      const champURL = funcs.getGraphicURL(champion[0]);
      // const champCords = "0,0," + champURL +"," + champion[1];
      coordinates.push({id: charactersIds, x:champion[2], y:champion[3], graphic: champURL, sizeMultiplier: champion[4]});
      saveCurrentState();
      const newChampData = [champURL, charactersIds, champion[2], champion[3], champion[4]];
      socket.emit('char_added', newChampData);
      socket.broadcast.emit('char_added', newChampData);
      charactersIds++;
      // socket.emit('new_coords', coordinates);
      // socket.broadcast.emit('new_coords', coordinates);
    })

    socket.on('delete-asset', id => {
      coordinates = coordinates.filter(cor => cor.id != id);
      socket.broadcast.emit('delete-asset', id);
      saveCurrentState();
    })

    socket.on('clear', () =>{
      coordinates = [];
      saveCurrentState();
      socket.emit('new_coords', coordinates);
      socket.broadcast.emit('new_coords', coordinates);
    })

    socket.on('addLine', lineData => {
      if (lines.length >= MAX_NUMBER_OF_LINES) return;
      lines.push(lineData);
      socket.emit('lines', lines);
      socket.broadcast.emit('lines', lines);
    })

    socket.on('deleteLine', id => {
      lines = lines.filter(oneLine => oneLine.id !== id);
      socket.emit('lines', lines);
      socket.broadcast.emit('lines', lines);
    })

    socket.on('clearLines', () => {
      lines = [];
      socket.emit('lines', lines);
      socket.broadcast.emit('lines', lines);
    })

    socket.on('linesPlease', () => socket.emit('lines', lines));

    socket.on('clear-init', () =>{
      initiative_box = [];
      saveCurrentState();
      socket.emit('clear-init-window');
      socket.broadcast.emit('clear-init-window');
    })

    socket.on('new-ini-row', init_row =>{
      initiative_box.push(init_row);
      saveCurrentState();
      socket.emit('new_ini', init_row);
      socket.broadcast.emit('new_ini', init_row);
    })

    socket.on('require-velocities', () =>{
      socket.emit('velocities', current_velocities)
    })

    socket.on('assign_current_player', player =>{
      current_player = player;
      socket.broadcast.emit('new_current_champion', current_player);
    })

    socket.on('emphasize', ([x, y]) => {
      if (emphasizing) return;
      socket.emit('emphasizeOrder', [x, y]);
      socket.broadcast.emit('emphasizeOrder', [x, y]);
      emphasizing = true;
      setTimeout(() => {emphasizing = false}, EMPHASIZE_TIMEOUT);
    })

    socket.on('roll', control_word =>{
      rolling_result = rolling.calculate(control_word[0]);
      savedInitiativeRolls = funcs.saveIniRolls(isInitiativeScriptWorking, savedInitiativeRolls, rolling_result, control_word[1], users[socket.id]);
      if (rolling_result == null) socket.emit('wrong_input');

      else
      {
      rolling_msg = rolling.prepare_chat_message(rolling_result, control_word);
      chat_messages = funcs.chat_handling(rolling_msg, chat_messages, users[socket.id], "roll");
      socket.emit('chat-mesage', chat_messages);
      socket.broadcast.emit('chat-mesage', chat_messages);
      }
      
    });

    socket.on('spam-bot-command', () => {
      socket.emit('spam-bot');
    })

    socket.on('resetCommand', meta => {
      socket.emit('resetLoaded', meta);
      socket.broadcast.emit('resetLoaded', meta);
    })
    
    socket.on('my-name', name => {
      users[socket.id] = name;
    })

    socket.on('character-stat-change', stats => {
      stats[0] = './' + character_folder + "/" + stats[0]; //Add path to character name
    })

    socket.on('character-stat-new', controls => {
      let stats = controls[0];
      let control_word = controls[1];
      stats[0] = './' + character_folder + "/" + stats[0]; //Add path to character name
    })

    socket.on('ini-start', () => {
      savedInitiativeRolls = [];
      isInitiativeScriptWorking = true;
    })

    socket.on('ini-stop', () => {
      if (savedInitiativeRolls.length == 0) return;
      const preparedIni = funcs.prepareIniList(savedInitiativeRolls);
      preparedIni.forEach(iniRow => {
        initiative_box.push(iniRow.name);
      })
      saveCurrentState();
      isInitiativeScriptWorking = false;
      savedInitiativeRolls = [];
      socket.emit('start_init', initiative_box);
      socket.broadcast.emit('start_init', initiative_box);
    })
  


  });


server.listen(port, () => {
  //console.log('listening on *:3000');
});



saveCurrentState = () => {

  saveMe =     {
    "map": current_map,
    "base": rolling_base,
    "ini": initiative_box,
    "chars": coordinates
  }

}
