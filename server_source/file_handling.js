exports.get_array = function(fs, path){
    var text = fs.readFileSync(path).toString('utf-8');
    return text.split("\n");
}

find_array_element_with_key = function(json_array, json_key){
    let index = 0;
    let found_index;

    //Looping throug array of JSONs. If json_key is in current index we are done.
    json_array.forEach(array_element =>{
        if (array_element[json_key])
            found_index =  index;
        else
            index++;
    })

    return found_index;

}

update_json = async function(file_name, key, value, fs, char_name, socket, control_word = "edit", db){
    //prepare collection's name
    let character_name = char_name.slice(char_name.lastIndexOf("/") + 1);
    const collectionName = character_name + "'sstats";
    const read_data = await db.getAndSendCharactersStats(collectionName, null);
    db.getAndSendCharactersStats
    let json_index = find_array_element_with_key(read_data, key);

    //Prepare data
    let new_label;
    let new_key = "";
    let new_object = {};
    if (control_word.includes("add"))
    {
        if (control_word.includes("label"))
        {
            new_label = find_last_label(read_data) + 1;
            new_key = "label" + new_label.toString();
            new_object[new_key] = value;
            read_data.push(new_object);
            db.writeCharactersStats(collectionName, new_object);
            socket.emit('modal-body-content', [read_data, character_name + "'sstats"]);
            return;
        }

        else if (control_word.includes("entry"))
        {
            new_label = find_last_entry_in_label(read_data[json_index]); //Number of last entry
            new_label++; //Number of current entry
            new_key = key.slice(key.lastIndexOf("l"), key.length + 1); //l1 or l2 or l3 etc.
            new_key = new_key + "entry" + new_label.toString(); //p.e. label4entry8
            read_data[json_index][new_key] = value;
            db.updateCharactersStats(read_data[json_index]._id, collectionName, read_data[json_index]);
            socket.emit('modal-body-content', [read_data, character_name + "'sstats"]);
            return;
        }
    }

    else if (control_word == "edit") {
        read_data[json_index][key] = value; //update value
        db.updateCharactersStats(read_data[json_index]._id, collectionName, read_data[json_index]);
        socket.emit('modal-body-content', [read_data, character_name + "'sstats"]);
        return;
    }

    else if (control_word == "delete")
        {
            if (key.includes("entry")) 
            {
                delete read_data[json_index][key];
                db.updateCharactersStats(read_data[json_index]._id, collectionName, read_data[json_index]);
                socket.emit('modal-body-content', [read_data, character_name + "'sstats"]);
                return;
            }
                
                    
            else if (key.includes("label"))
            {
                db.deleteCharactersStats(read_data[json_index]._id, collectionName);
                read_data.splice(read_data.lastIndexOf(read_data[json_index]), 1);
                socket.emit('modal-body-content', [read_data, character_name + "'sstats"]);
                return;
            }
                        
        }
}



find_last_label = function(json_array){
    //Some systems might shuffle content of json file
    //So we have to check for every label in file
    let label_id;
    let biggest_id = 0;
    let current_keys = [];
    json_array.forEach(array_element =>{
        current_keys = Object.keys(array_element); //Get keys in current array
        current_keys.forEach(key => {
            if (key.includes("label")) //Check for label's name
            {
                label_id = key.slice(key.lastIndexOf("l") + 1, key.length); //extract label's number
                if (Number(label_id) > biggest_id) 
                    biggest_id = Number(label_id); //Our goal is to find the biggest number
            }
        })
    })

    return biggest_id;
}

find_last_entry_in_label = function(json_object)
{
    if (typeof json_object != "object") return null;
    let last_number = 0;
    let current_number;

    for (const key in json_object)
    {
        if (key.includes("label")) continue;

        //Here we have only entries
        current_number = key.slice(key.lastIndexOf('y') + 1, key.length);
        if (Number(current_number) > last_number) last_number = Number(current_number);
    }

    return last_number;
}

exports.update_character_stats = function(data_from_FE, fs, socket, control_word, db){
    //Unpack data from Front End
    let char_name = data_from_FE[0];
    let key = data_from_FE[1];
    let data_header = data_from_FE[2];

    let data_content;
    let data_checkbox;

    if (data_from_FE.length > 3) //Label has only 3 elements, entry has more
    {
        data_content = data_from_FE[3];
        data_checkbox = false; //TODO
    }

    //Pack data to object
    let json_value;
    if (control_word == "edit" || control_word.includes("add entry"))
    {   
        if (key.includes("entry") || control_word.includes("add entry")) 
            json_value = {"header": data_header, "content": data_content, "checkbox" : data_checkbox};

        else if (key.includes("label"))
            json_value = data_header;
    }

    if (control_word.includes("add label"))
        json_value = data_header;
    

    //Determine filename
    let filename = char_name + "'sstats.json";
    update_json(filename, key, json_value, fs, char_name, socket, control_word, db);
}

