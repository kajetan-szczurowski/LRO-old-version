class Chat {
    constructor()
    {
          this.chat_box_div = make_element_with_classes("div", "chat-box");
          this.message_array = [];

          this.window = new Window({
              id: "chat_window",
              content: this.chat_box_div
          });

          this.window.create();

    }

    update_content(content)
    {
        
        if (!Array.isArray(content)) throw new Error('Messages must be in an array.')

        for (let i = 0; i < content.length; i++)
        {   
            if (this.is_equal(content[i], this.message_array[i]))
            {
                //I have already displayed this message
                continue;
            }
            this.message_array[i] = content[i]; //We need to keep track of displayed entries
            let entry = content[i]; //Let's break this entry
            let entry_div = make_element_with_classes("div", entry.category);
            //entry.category is msg or roll or command
            let name = entry.sender;
            if (entry.category == "roll")
                name += " rolls:"
            else if (entry.category = "msg")
                name += ":";
            name += " ";//every type of message require space after name of the sender

            let name_div = make_element_with_classes("span", "chat-sender");
            name_div.textContent = name;
            entry_div.appendChild(name_div);
            let content_div = null;
            if (entry.category != "roll")
            {
                content_div = make_element_with_classes("span", "chat-message");
                content_div.textContent = entry.content;
            }

            else //it's a roll!
            { 
                //We heve to unpack entry
                let order = entry.content.order; // p.g. d20+3-5+d4
                let commentary = entry.content.commentary; 
                let result = entry.content.result;

                let roll_div = make_element_with_classes("span", "roll-result-complete");

                let first_value = true; //We are processing first input
                let order_past_d;

                entry.content.numbers.forEach(result => {
                    let output_div = null;
                    if (result.flag == "roll")
                        {

                        if (first_value && !result.value.includes("+"))
                        {
                        //First input was a single roll so it can be natural 1 
                        //or natural max
                            order_past_d = order.slice(order.indexOf("d") + 1);
                            if (order_past_d.includes("+"))
                                order_past_d = order_past_d.slice(0, order_past_d.indexOf("+"))
                        
                            if (result.value == order_past_d)
                                output_div = make_element_with_classes("span", "natural-max");  
                            else if (result.value == "1")
                                output_div = make_element_with_classes("span", "natural-one");
                            else //not a max, not a one
                                 output_div = make_element_with_classes("span", "roll-result");
                        }
                    
                        else
                            output_div = make_element_with_classes("span", "roll-result");

                        }

                    else //it's not a roll
                        output_div = make_element_with_classes("span", "modifier-result");

                    output_div.innerHTML = result.value;
                    roll_div.appendChild(output_div);
                    
                    first_value = false;
                })

                let equals_div = make_element_with_classes("span", "chat-equals");
                equals_div.innerHTML = result;
                roll_div.appendChild(equals_div);

                let commentary_div = null;
                let order_div = null; 


                order_div = make_element_with_classes("span", "roll-order");
                order_div.innerHTML = order;
                roll_div.appendChild(order_div);
                if (commentary)
                {
                    commentary_div = make_element_with_classes("span", "roll-commentary");
                    commentary_div.innerHTML = commentary;
                    roll_div.appendChild(commentary_div)
                }

                content_div = roll_div;
                
            }

            //We prepare entire content of the message. Let's put it to
            //the aimed div

            entry_div.appendChild(content_div);
            
            //Last thing - timestamp
            let timestamp_div = make_element_with_classes("span", "timestamp-chat");
            timestamp_div.innerHTML = entry.timestamp;
            entry_div.appendChild(timestamp_div);

            this.chat_box_div.appendChild(entry_div);

        }
    }

    refresh()
    {
        this.window.refresh_content(this.chat_box_div);   
    }

    update_and_refresh(content)
    {
        this.update_content(content);
        this.refresh();
    }

    is_equal(entry_obj1, entry_obj2)
    {
        if (!entry_obj1 || !entry_obj2) //At least one of the objects is undefined
            return false;
        if (entry_obj1.category != entry_obj2.category) 
            return false;
        if (entry_obj1.sender != entry_obj2.sender) 
            return false;
        if (entry_obj1.timestamp != entry_obj2.timestamp) 
            return false;  

        //content my be string or an object (in case of a roll)
        
        if (typeof entry_obj1.content == "string")
        if (entry_obj1.content != entry_obj2.content) 
            return false;
        
        else //it is an object from roll dice
            if (entry_obj1.content.result != entry_obj2.content.result)
                return false;
                
        
        
        return true;
    }

}