
function random_num(min, max) {
    min = Number(min);
    max = Number(max);
    result = Math.floor(Math.random() * max) + min;
	return result; 
    
}

const digits_and_sub_mark = string => [...string].every(c => '0123456789-'.includes(c));

execute_rolls = function(rolls){
    var rolls_and_modifiers = [];
    var current_roll;
    for (let i=0; i < rolls.length; i++){
        let subs = false; //from default we are not going to sub rolled value
        
        if (rolls[i].includes("d")) { //let's roll!
            current_roll = "";
            //First step - search for d
            for (var j = 0; j < rolls[i].length; j++) 
                if (rolls[i][j] == "d") break;
            
            amount_of_rolls = rolls[i].slice(0,j);
            
            
            if (amount_of_rolls == "" || amount_of_rolls == "-") amount_of_rolls = "1"; //d was a first sign, so it should be rolled once
            if (rolls[i][0] == "-") subs = true;

            if (digits_and_sub_mark(amount_of_rolls) == false) return "Typing error"; //Somebody put illegal signs here!
            amount_of_rolls = Number(amount_of_rolls);
            amount_of_rolls = Math.abs(amount_of_rolls); //You cannot roll negative times

            //We know how many rolls will be taken, now we must specify type of dice
            if (rolls[i].length <= j+1) return "Typing error"; //Somebody didn't put type of dice, that's illegal!

            type_of_dice = rolls[i].slice(j+1,rolls[i].length);
            

            if (isNaN(type_of_dice)) return "Typing error"; 
            if (type_of_dice.includes("-")) return "Typing error";

            //Time to roll!
            
            for (let k = 0; k < amount_of_rolls; k++)
            {
              result = random_num(1, type_of_dice);
              if (subs){
              current_roll = current_roll.concat((result * (-1)).toString());
              current_roll = current_roll.concat(" ");

              }
              else
              {
                current_roll = current_roll.concat("+");
                current_roll = current_roll.concat(result.toString());

              }
            }

            rolls_and_modifiers.push({value:current_roll, flag:"roll"});

        }//main if
        else // it's not a roll, we have to just add or sub value
        {
            if (digits_and_sub_mark(rolls[i]) == false) return "Typing error"; //Illegal statement!

            if (rolls[i][0] != "-")
                rolls_and_modifiers.push({value: "+".concat(rolls[i]), flag: "modifier"});
            else
                rolls_and_modifiers.push({value: rolls[i], flag: "modifier"});
        }

    }//main for

    if (rolls_and_modifiers[0].value[0] == "+")
        rolls_and_modifiers[0].value = rolls_and_modifiers[0].value.slice(1, rolls_and_modifiers[0].value.length+1);
    return rolls_and_modifiers;
}

exports.calculate = function(control_word){
    //put something like: "2d8+d6+3-10", get array of this
    current_ingredient = "";
    rolls = [];

    for (let i=0; i < control_word.length; i++) {
        
        if (control_word[i] == "+") //Something will be added
        {
            rolls.push(current_ingredient);
            current_ingredient = "";
        } 
        else if (control_word[i] == "-")
        {
            rolls.push(current_ingredient);
            current_ingredient = "-"; //Adding is default operation, sub is not, so i have to mark it.
        }
        else //Current sing is not a separator
        {
            current_ingredient = current_ingredient.concat(control_word[i]);
        }
    }
    if (current_ingredient != "") rolls.push(current_ingredient);
    results = execute_rolls(rolls);
    if (results == "Typing error") {
        return null;
    }

   return results;
}


prepare_result_value = function(result){
          //Take array of jsons, extract numbers, concat them, calculate it
          let numbers = "";
          result.forEach(res => {
            numbers = numbers.concat(res.value);
          })
           return eval(numbers).toString();
}


  exports.prepare_chat_message = function(rolling_result, message){
    let rolling_output = {
        numbers: rolling_result,
        result: prepare_result_value(rolling_result),
        order: message[0],
        commentary: message[1]
    }

    return rolling_output;
}