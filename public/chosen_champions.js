const getCharacterData = (key) => {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(loadedFromServer, key)
    if (!loadedFromServer.includes(key) || !data){
        socket.emit('create-modal', key);
        return;
    }

    if (key.includes("'srolls")){
        prepare_character_sheet(data);
        return;
    }

    if (key.includes("'sstats")){
        champions_stats_windowds.push(new CharStats(data));
        champions_stats_windowds[champions_stats_windowds.length - 1].prepare_character_stats();
        return;
    }
}

assign_playable_characters = (champions_word, container) => {
    let champions = champions_word.split(',');
    let success = false;
    playable_champions = [];
    let buttons_texts;
    
    for (let i = 0; i < champions.length; i++) {
        buttons_texts = [];
        current_champ = champions[i].toLowerCase().split(' ').join('');
        if (avatars_to_choose.includes(current_champ))//If such champion exists
        { 
            let name = champions[i].split(' ').join('');
            buttons_texts = [name + "'s rolls"];
            success = true;

            buttons_texts.forEach(text => {

                let button = document.createElement('button');
                button.innerHTML = "Button";
                button.innerText = text;
                button.classList.add("playable_font", "character_choice_button");
    
                button.addEventListener('click', e => {
                    const valueName = button.innerText.toLowerCase().split(' ').join('');
                    getCharacterData(valueName)
                })
    
                container.appendChild(button);
                playable_champions.push(champions[i].trim());

            })

           
        }
    }

    if (success) container.classList.add("playable_box");
    else container.classList.remove("playable_box");
}


character_state_click = (html_element, label) => {
    let bonus_value = html_element;
    let stateLabel = label;
    let firstHashLenght;

    if (typeof label === "string"){
        if (label.includes("("))
        stateLabel = label.substring(0, label.indexOf("("));
    }   

    if (typeof bonus_value == "number")  message_input.value = "#" + rolling_base + "+" + bonus_value +" #" + stateLabel;
    else  message_input.value = "#" + bonus_value;
    message_input.focus();

    if (typeof bonus_value == "number"){
        firstHashLenght = ("#" + rolling_base + "+" + bonus_value + " ").length;
    } message_input.setSelectionRange(firstHashLenght, firstHashLenght);
    
}




