//Required functions 

get_time = (date_too = false) => {
  let date_ob = new Date();

  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();

  let hours = ("0" + (date_ob.getHours() + 1)).slice(-2);
  let minutes = ("0" + (date_ob.getMinutes() + 1)).slice(-2);
  let seconds = ("0" + (date_ob.getSeconds() + 1)).slice(-2);

// prints date & time in DD-MM-YY HH:MM:SS format
//return date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;

// prints date & time in HH:MM:SS DD-MM-YY format
if (date_too)
  return hours + ":" + minutes + ":" + seconds + " " + date + "-" + month + "-" + year;

return hours + ":" + minutes + ":" + seconds;

}

ExtractValue = function(dense_information, separator, number_of_information){
    let extracted_value = "";
    var current_value = 1; //current value we are reading
    
    let i = 0;
  
    for (i = 0; i < dense_information.length; i++) 
    {
      if (dense_information[i] == separator) //check if we see seperator e.g. comma or dot
        current_value++;   
  
      if (dense_information[i] != separator && current_value == number_of_information)
        extracted_value = extracted_value.concat(dense_information[i]);    
  
    }
  
    return extracted_value;
  
  }
  
exports.update_cords = function(dense_information_from_client, coordinate_array)
  {
    var old_x = dense_information_from_client[0];
    var old_y = dense_information_from_client[1];
    var new_x = dense_information_from_client[2];
    var new_y = dense_information_from_client[3];
  
    var current_x;
    var current_y;
    
    for (let i = 0; i < coordinate_array.length; i++) //Let's search for moved avatar
    {
      current_x = ExtractValue(coordinate_array[i], ",", 1);
      current_y = ExtractValue(coordinate_array[i], ",", 2);
      
      if (current_x == old_x && current_y == old_y) //We found set avatar
      {
        
        var image_id = ExtractValue(coordinate_array[i], ",", 3);
        const avatar_name = ExtractValue(coordinate_array[i], ",", 4);
        
        //Time to create new row in coordinates array
        new_coordinate = "";
        new_coordinate = new_coordinate.concat(new_x);
        new_coordinate = new_coordinate.concat(",");
        new_coordinate = new_coordinate.concat(new_y);
        new_coordinate = new_coordinate.concat(",");
        new_coordinate = new_coordinate.concat(image_id);
        new_coordinate = new_coordinate.concat(",");
        new_coordinate = new_coordinate.concat(avatar_name);
  
        coordinate_array[i] = new_coordinate;
  
      }
  
    }
  
  }
  
  
exports.chat_handling = function(new_message, messages_array, user_name, type) {

  let new_chat_entry = {
    content: new_message,
    category: type,
    timestamp: get_time(),
    sender: user_name
  };

  let messages = messages_array;
  messages.push(new_chat_entry);

  return messages;
  }

  exports.getGraphicURL = function(googleDriveURL){
    const graphID = googleDriveURL.substring(googleDriveURL.indexOf("/d/") + 3, googleDriveURL.lastIndexOf("/"));
    const finalURL = "https://drive.google.com/uc?id=" + graphID;
    return finalURL;
  }

  exports.saveIniRolls = function(isSavingTurnedOn, iniRolls, rolledValues, label, userName) {
    if (!isSavingTurnedOn) return [];
    const readValues = [];
    const currentValues = iniRolls;
    rolledValues.forEach(val => readValues.push(Number(val.value)));
    const rollResult = readValues.reduce((partialSum, element) => partialSum + element, 0);
    currentValues.push({'name': label, 'value': rollResult, 'bonus': rollResult - Number(rolledValues[0].value), user: userName});
    return currentValues;
  }

  exports.prepareIniList = function(unsortedGroup){
    const groupToPrep = unsortedGroup;
    groupToPrep.sort((a, b) => {
      if (a.value === b.value) return b.bonus - a.bonus;
      return b.value - a.value;
    })

    groupToPrep.forEach(element => {
      if (!element.name) element.name = "";
      if (element.name.includes("Initiative-")) 
        element.name = element.name.substring("Initiative-".length, element.name.length);
    })

    return groupToPrep;
  }
