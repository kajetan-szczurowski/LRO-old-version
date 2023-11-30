prepare_character_sheet = (JSON_array) => {
    let my_id;
    if (typeof JSON_array != "object") return null;

    //Step one - let's prepare content from json file

    main_div = document.createElement("div"); //We are going to store everything here
    JSON_array.forEach(obj =>{
        let new_div; //I will put one information here, this will be put to main_div

        for (const [key, value] of Object.entries(obj)) {
            new_div = null;
            if (key == "_id" || key == "name") continue;
            if (key == "id") {
                my_id = prepare_id(value);
                continue;
            }

            if (key == "label") //just unclickable label
                new_div = make_element_with_classes('div', 'character-sheet-label', value);

            else
               //here i have array - label(string) and value(number or string like 4d2+1)
               {
                let atr_name_div = make_element_with_classes('div', 'character-sheet-atrribute-name', value[0]);

                if (typeof value[1] == "string" && value.length != 3)
                {
                    value[1] = calculate_attribute_value(value[1], JSON_array);
                }

                let atr_value_div = make_element_with_classes('div', 'character-sheet-value', value[1]);
                new_div = make_element_with_classes('div', 'character-sheet-entry');
                new_div.appendChild(atr_name_div);
                new_div.appendChild(atr_value_div);
                //We have text, lets make it clickable
                if (value.length != 3) //third element means that this shouldn't be clickable
                {
                new_div.classList.add('clickable-character-sheet-entry');
                new_div.onclick = () => character_state_click(value[1], value[0]);
                }
               }
            main_div.append(new_div);
          
        }

    })

    character_boxes.push(new Window({
        // id: my_id,
        id: String(Date.now()),
        content: main_div, 
        closing_button: true, 
        window_style: "character-sheet", 
        header_style: 'modal-header', 
        title_style: 'title', 
        title: "Character Sheet:",
        draggable: true}));

   let index = character_boxes.length - 1;
   character_boxes[index].create();

}

calculate_attribute_value = (math_recipe, json_array) =>{
    if (typeof math_recipe != "string") return math_recipe; //wrong recipe
    
    let recipe = math_recipe.replace(/\s+/g, ''); //recipe without white spaces
    let working_array = (atribute_string_to_array(recipe));
    let last_sign = "+"; //if not specified, we take adding as default math operation
    let calculated = 0;
    let dice_rolls = "";
    let last_element_was_roll_order = false;

    working_array.forEach(val =>{
        let just_value = digits_only(val);
        let just_sign = val == "+" || val == "-";
        let dice_roll_order = is_dice_roll(val);
        

        if (just_value)
        {
            if (last_sign == "+") calculated += Number(val);
            if (last_sign == "-") calculated -= Number(val);
        }

        if (just_sign) 
        {
            last_sign = val;
            if (last_element_was_roll_order) dice_rolls += val;
        }

        if (!just_value && !just_sign && !dice_roll_order)
        {
            //so here we have id from json file. Its time to find the value.
            found_value = get_value_from_character_sheet(val, json_array);
            if (last_sign == "+") calculated += Number(found_value);
            if (last_sign == "-") calculated -= Number(found_value);
        }

        if (dice_roll_order)
        {
            
            dice_rolls += val;
            last_element_was_roll_order = true;
        } 
        else last_element_was_roll_order = false;
    })

    if (dice_rolls != "") calculated = dice_rolls + calculated.toString();

    return calculated;
}

get_value_from_character_sheet = (wanted_id, json_array) =>{
    let calc_value;
    json_array.forEach(obj =>{
        for (const [key, value] of Object.entries(obj)) {
            if (key != wanted_id) continue; //not our id, next
            calc_value = calculate_attribute_value(value[1], json_array);
            break;
        }
    })

    return calc_value;
}

is_dice_roll = (word, dice_letter = "d") => {
    //we are looking for something like xdy where x and y are digits
    if (typeof word != "string") return false;
    if (word.length < 3) return false;

    for(let i=1; i<word.length-1; i++)
        if (is_numeric(word[i-1]) && is_numeric(word[i+1]) && word[i] == dice_letter)
            return true;
    
    return false; //If we didn't find anything in for loop then this is not a dice roll
}

prepare_id = (proposed_id) => {
    
    if (character_sheets_ids.length <= 0) 
    {
        character_sheets_ids.push(proposed_id + "$$1")
        return proposed_id + "$$1"; 
    }

    let proposed_is_ok = true;
    //it is a true statement if we won't find another 
    //instance of id with the same name

    //ids go like this - name$$x, where x is a number.
    let current_number;
    for(let i=0; i<character_sheets_ids.length; i++)
    {
        let cs_id = character_sheets_ids[i];
        let name = cs_id.slice(0, cs_id.indexOf("$"))
        if (name != proposed_id)
            continue;

        //we found another instance of this name
        current_number = cs_id.slice(cs_id.indexOf("$")+2, cs_id.length);
        proposed_is_ok = false;
    }

    if (proposed_is_ok) //we dind't find another instance of this name
    {
        character_sheets_ids.push(proposed_id + "$$1")
        return proposed_id + "$$1"; 
    }

    //This name is already displayed
    //We are going to insert new window with
    //id +1 after previous
    current_number = Number(current_number);
    current_number++;

    character_sheets_ids.push(proposed_id + "$$" + current_number.toString());
    return proposed_id + "$$" + current_number.toString(); 
}