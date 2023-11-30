const canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
//HTML canvas object on webpage

let canClick = true;

var movable_avatars = [];
var character_boxes = [];
var static_corpses = [];
var current_map_image;
const maps_folder = "/maps/";
const avatar_folder = "/avatars/";
var current_asset;
var currentMapX = 0;
var currentMapY = 0;

//Package of variables required for moving avatar
var somebody_is_checked = false;
var nobody_is_hit = true;
var checked_id = -1;
var old_x;
var old_y;
//End of package of variables required for moving avatar

var lineDrawingColor = "#000000";
let CharacterSizeMultiplier = 1;

//game constants
const MAP_WIDTH = 600;
const MAP_HEIGHT = 600;
const SIDE_OF_SQUARE = 50;

//initiative 
const initiative_window = document.getElementById('initiative-window');

//line drawing
const colorPicker = document.getElementById("line-color-picker");
colorPicker.onchange = () => lineDrawingColor = colorPicker.value;

//choosing champions
const champion_input = document.getElementById('characters_input');
const champion_form = document.getElementById('character_choice');
const champion_displayer = document.getElementById('chosen_characters_display');
const modal_body = document.getElementById('modal-body');
var rolling_base = ""; //It will be taken from the server after opening skills window
var playable_champions = [];
var champions_stats_windowds = [];
var champion_stat_edit_window;
var remove_stat_window;
var current_chosen_player = "";
const avatars_to_choose = [];
var loadedFromServer = JSON.parse(localStorage.getItem("loadedKeys"));
if (!loadedFromServer) loadedFromServer = [];

//Service of chat
const message_form = document.getElementById('send-container');
const message_input = document.getElementById('message-input');
var chatbox = new Chat();
var my_messages = []; //Array for every message written by this user
var my_messages_index = -1;

//Service of displaying range of movement
var require_to_change_velocity = true;
var velocities = [];

//GM only
const maps_button = document.getElementById('maps_button');
const assets_button = document.getElementById('assets_button');
const maps_list = document.getElementById('maps_list');
const assets_list = document.getElementById('assets_list');
const player_select = document.getElementById('current_player');
const choose_player = document.getElementById('choosePlayer');
const refresh_players = document.getElementById('refresh_players');
var maps;
var assets;


//Mechanics
var draggable_windows = [];
var character_sheets_ids = [];
var character_stats_cords = []; 


var user_name = localStorage.getItem("myName");
if (!user_name) {
    user_name = generateName();
    localStorage.setItem("myName", user_name);
}


function generateName(digitsSize = 7){
    var generated = "";
    let i;
    generated += Math.random().toString(36).slice(-5);
    for (i = 0; i < digitsSize; i++) generated += Math.round((Math.random() * 9)).toString();
    return generated;
}

function synchronizeAvatars(){
	socket.emit('synchronize');
}



socket.emit('new-user', user_name);
if (user_name != "GM") 
{ 
    maps_button.style.visibility="hidden";
    assets_button.style.visibility="hidden";
}

message_input.onfocus = reset_buffer_index; //if anyone clicks on input field we are going to reset counter of pre values to show
//after pressing arrow UP or DOWN.
document.onkeydown = checkKey;


socket.on('corpses', function(corpses){ //Corpses coordinates while loading page
    for (let i=0; i<corpses.length; i++) 
        static_corpses.push(corpses[i]);
})

socket.on('new_coords', function(coordinates){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_map();
    movable_avatars = DrawAvatars(coordinates);
    avatar_service();

}); //socket.on

socket.on('start_messages', messages_array => { //First i'm going to print all messages from server
    chatbox.update_and_refresh(messages_array);
})

socket.on('start_init', initiatives => {//Load initiative from server when loading page
    separate_array_of_chats(initiatives, initiative_window);
})

function useLoadedData(loaded) {
    rolling_base = loaded.base;
    separate_array_of_chats(loaded.ini, initiative_window);
    mainMap.loadImage(loaded.map);
}

socket.on('loaded', loaded => {
    useLoadedData(loaded);
    socket.emit('loadedResponse', loaded);
})

socket.on('loadedDone', loaded => {
    useLoadedData(loaded);
})


socket.on('chat-mesage', data => {
    chatbox.update_and_refresh(data);
})

socket.on('user_connected', data => {
    chatbox.update_and_refresh(data);
})

socket.on('disconnected', data => {
    chatbox.update_and_refresh(data);
})

socket.on('new_ini', init_row => {
    appendMessage(init_row, initiative_window);
})

socket.on('new-base', new_base => {
    rolling_base = new_base;
})

socket.on('clear-init-window', () => {
    initiative_window.innerHTML = "";
})

socket.on('wrong_input', () => {
    alert("Wrong input!");
})

socket.on('modal-body-content', raw_character_data => {
    let file_name = raw_character_data[1];
    let file_flag = file_name.slice(file_name.indexOf("'"));
    localStorage.setItem(file_name, JSON.stringify(raw_character_data[0]));
    loadedFromServer.push(file_name);
    localStorage.setItem("loadedKeys", JSON.stringify(loadedFromServer));

    if (file_flag == "'srolls")
        prepare_character_sheet(raw_character_data[0]);
    
    if (file_flag == "'sstats")
    {
        champions_stats_windowds.push(new CharStats(raw_character_data[0]));
        champions_stats_windowds[champions_stats_windowds.length - 1].prepare_character_stats();
    }
        
})

socket.on('resetLoaded', meta => {
    loadedFromServer = loadedFromServer.filter(element => !element.includes(meta));
    localStorage.setItem("loadedKeys", JSON.stringify(loadedFromServer));
})

socket.on('velocities', velocity_array => {
    require_to_change_velocity = true;
    velocities = velocity_array;
})

socket.on('new_current_champion', new_champion => {
    current_chosen_player = new_champion;
})
//
socket.on('GM_list_content', content => {
    let container = null; 
    const meta = content[1];
    let content_data = content[0][0];
    if (meta === "players") content_data = content[0]
    if (content_data.hasOwnProperty('_id')) delete content_data["_id"];
    

    if (meta.includes("maps")) container = maps_list;
    if (meta.includes("assets")) container = assets_list;

    if (meta.includes("players")) 
    { 
        player_select.innerHTML = ""; //fresh start
        content_data = Object.values(content_data)
        content_data.forEach(player => 
            {
                new_option = document.createElement('option');
                new_option.value = player;
                new_option.innerHTML = player;
                player_select.appendChild(new_option);
            })
        content_data = null;
        return;
    }

    const isAnObject = typeof content_data === "object" && content_data !== null;
    if (!isAnObject) {
        container.innerText = "Error while reading values from the server.";
        return;
    }
    if (meta.includes("maps")) maps = content_data;
    if (meta.includes("assets")) assets = content_data;
    content_data = Object.keys(content_data);
    separate_array_of_chats(content_data, container, true, "GM_list");
    
})

socket.on('give_me_name', () => {
    while (!user_name) {
        alert("Please enter your name!");
        user_name = prompt("What's your name?");
    }

    socket.emit('my-name', user_name);
    
})


message_form.addEventListener('submit', e => {
    e.preventDefault(); //Prevent from refreshing
    const message = message_input.value; //Extract message from html object
    remember_message(message);
    processed_message = chat_service(message);

    if (processed_message.includes("/abandon")) {
        message_input.value = "";
        return;
    }

    if (processed_message != null && !processed_message.includes("new_champ") && !processed_message.includes("init add"))
    {
        socket.emit('send-chat-message', processed_message); //Send message to backend
        message_input.value = ""; //clear window for new messages
    }

    if (processed_message.includes("cleared everything.")){
        message_input.value = "";
        socket.emit('clear');
    } 

    if (processed_message.includes("reset loaded")){
        message_input.value = "";
        socket.emit('resetCommand', message.substring("/reset ".length, message.length));
    } 
    

    if (processed_message.includes("init add")){
        new_init = processed_message.slice(8);
        socket.emit('new-ini-row', new_init);
    }

    if (processed_message.includes("cleared init window.")){
        socket.emit('clear-init');
    }

    if (processed_message.includes("changed name to:")){
        const myNewName = processed_message.substring(17, processed_message.length);
        user_name = myNewName;
        socket.emit('my-name', myNewName);
        localStorage.setItem('myName', user_name);
    }

    if (processed_message.includes("started initiative rolls.")){
        socket.emit('ini-start');
    }

    if (processed_message.includes("finished initiative rolls.")){
        socket.emit('ini-stop');
    }
    
})

function appendMessage(message, container, clickable, type_of_text) {
    const message_element = document.createElement('div');
    message_element.innerText = message;

    if (clickable){
        if (type_of_text == "character_sheet")
        message_element.onclick = () => character_state_click(message_element.innerText);

        if (type_of_text == "GM_list")
        message_element.onclick = () => gm_list(message_element.innerText);

        message_element.classList.add("clickable-text");
    };

    container.append(message_element);
    
}

function separate_array_of_chats(array_of_messages, container, clickable = false, type_of_text = null) {
    container.innerHTML = "";
    if (!array_of_messages) return;

    for (let i = 0; i < array_of_messages.length; i++)
        appendMessage(array_of_messages[i], container, clickable, type_of_text);
}

maps_button.addEventListener("click", () => {
    socket.emit('GM_list', "maps");
    current_asset = "maps";

    if (maps_list.style.display === "block") maps_list.style.display = "none";
    else maps_list.style.display = "block";
})

assets_button.addEventListener("click", () => {
    socket.emit('GM_list', "assets");
    current_asset = "avatars";
    if (assets_list.style.display === "block") assets_list.style.display = "none";
    else assets_list.style.display = "block";
})

gm_list = (value) => {
    if (current_asset == "maps"){
        socket.emit('new-map', maps[value]);
    }

    if (current_asset == "avatars"){
        if (isNaN(CharacterSizeMultiplier)) CharacterSizeMultiplier = 1;
        socket.emit('new_champ', [assets[value], value, currentMapX, currentMapY, CharacterSizeMultiplier]);
        CharacterSizeMultiplier = 1;
    }
    
    maps_list.style.display = "none";
    assets_list.style.display = "none";
   
 
}

champion_form.addEventListener('submit', e =>{
    e.preventDefault();
    champion_displayer.innerHTML = "";
    assign_playable_characters(champion_input.value, champion_displayer);
    champion_input.value = "";

})

