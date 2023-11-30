function chat_service(message){
    let first_char = message[0];
    switch(first_char){
        case "#": //time to roll
            let roll_order = message.split("#"); //first element is roll order
            //second is an optional commentary
            roll_order = roll_order.slice(1,3); //We are using only 1st and 2nd parts of a roll order.
            roll_order[0] = roll_order[0].replace(/\s+/g, '');
            //Remove whitespaces from a rolling order

            console.log(roll_order);

            socket.emit('roll', roll_order);
            return "/abandon"; //That's all, server will do the rest
        
        case "/": // oh boy, it's a command!
        {
            command = message; 
            
            if (command.includes("/clear")){
                return "cleared everything.";
            }

            if (command.includes("/ini start")){
                return "started initiative rolls."
            }

            if (command.includes("/ini stop")){
                return "finished initiative rolls."
            }

            if (command.includes("/reset")){
                return "reset loaded"
            }

            if (command.includes("/base")){
                socket.emit('base', message.slice(6, message.length+1));
                return "/abandon"; //That's all, server will do the rest
            }

            if (command.includes("/name")){
                return "changed name to:" + command.substring(5, command.length);
            }
            
            if (command.includes("/ini")){ //we are working with initiative
                var separated_command = command.split(/(\s+)/); //string with spaces to array
                var command_before_filtering = separated_command;

                separated_command = remove_blank_words(separated_command);
                
                //ExtractValueFromServer(dense_information, separator, number_of_information)

                if (separated_command[1] == "add"){
                    let comma_counter = 0;
                    let new_initiative_row = command_before_filtering.slice(2).join();
                    
                    for (var i = 0; i < new_initiative_row.length; i++)
                    {
                        if (new_initiative_row[i] == ",")
                            comma_counter++; 
                        
                        if (comma_counter >= 2)
                            break;
                    }

                    //We know where we have to separete string - it's a place of second comma from start
                    new_initiative_row = new_initiative_row.slice(i);
                    new_initiative_row = remove_specific_char(new_initiative_row, ",");
                    return "init add".concat(new_initiative_row);
                }

                else if (separated_command[1] == "clear"){
                    return "cleared init window.";
                }
            }
        }

        default: //just a normal message - boring.
            return message;
    }
}


function checkKey(e) { //Up and down arrow keys for presenting past values in input box

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        console.log(my_messages_index);
        if (my_messages_index < 0 && my_messages.length > 0){ //We are going to show previous values from the start
            my_messages_index = my_messages.length - 1;

        }
        else if (my_messages_index > 0 && my_messages.length > 0){ //We are going to show older values
            if (my_messages_index > 0)
                my_messages_index--; //0 is the lower border
        }
        message_input.value = my_messages[my_messages_index];

    }
    else if (e.keyCode == '40') {
        // down arrow
        if (my_messages_index >= 0 && my_messages_index < my_messages.length - 1)
        { 
            my_messages_index++;
            message_input.value = my_messages[my_messages_index];
        }
    }

}

function remember_message(new_message){
    if (my_messages.length > 0)
    { 
        if (my_messages[my_messages.length - 1] == new_message)
            return; //don't duplicate messagess in the buffer
    }
    my_messages.push(new_message);
}

function reset_buffer_index(){
    my_messages_index = -1;
}
