function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}


function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function is_numeric(value) {
  return /^-?\d+$/.test(value);
}

give_me_div = (text_inside) => {
  let my_div = document.createElement('div');
  my_div.innerText = text_inside;
  return my_div;
}

make_element_with_classes = (element, classes, insideText = null, insideHTML = null) => {
  if (typeof element != "string") return null;

  let my_element = document.createElement(element);

  if (Array.isArray(classes)) my_element.classList.add(... classes);
  else if (typeof classes === 'string' && classes != "") my_element.classList.add(classes);
  else if (classes != "") return null; //Classes declaration was wrong, I have nothing to return

  if ((insideText && element == "div") || typeof insideText == "number") my_element.innerText = insideText;
  if (insideHTML) my_element.innerHTML = insideHTML;

  return my_element;
}

make_input = (default_text, classes = "") => {
  if (typeof default_text != "string") return null;

  let my_element = document.createElement("input");
  
  my_element.setAttribute("type", "text");
  my_element.value = default_text;

  if (Array.isArray(classes)) my_element.classList.add(... classes);
  else if (typeof classes === 'string' && classes != "") my_element.classList.add(classes);
  else if (classes != "") return null; //Classes declaration was wrong, I have nothing to return

  return my_element;
}

make_multiple_line_input = (rows, columns, default_text, classes) => {
  if (typeof default_text != "string") return null;
  if (typeof Number.isInteger(rows) == false || Number.isInteger(columns) == false)
    return null;

  let my_element = document.createElement("textarea");
  
  my_element.value = default_text;
  my_element.cols = columns;
  my_element.rows = rows;

  if (Array.isArray(classes)) my_element.classList.add(... classes);
  else if (typeof classes === 'string' && classes != "") my_element.classList.add(classes);
  else if (classes != "") return null; //Classes declaration was wrong, I have nothing to return

  return my_element;
}



const digits_only = string => [...string].every(c => '0123456789'.includes(c));
const digits_and_sub_mark = string => [...string].every(c => '0123456789-'.includes(c));
var has_number = /\d/;  //if string contains numbers

function ExtractValueFromServer(dense_information, separator, number_of_information){
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

function prepare_coordinates_to_backend(old_x, old_y, new_x, new_y)
{
  var information = [];
  information.push(old_x);
  information.push(old_y);
  information.push(new_x);
  information.push(new_y);
  
  return information;
}

function remove_blank_words(word_array){
  filtered_array = [];
  for (let i = 0; i < word_array.length; i++){
    if (word_array[i].replace(/\s/g, '').length) { //if string DOES NOT contain only whitespace
      filtered_array.push(word_array[i]);
    } 
  }
  return filtered_array;
}

function remove_specific_char(word, char_to_remove){
  new_word = "";
  for (let i = 0; i < word.length; i++)
    if (word[i] != char_to_remove)
      new_word = new_word.concat(word[i]);
  
  return new_word;
}

function delete_modals(){

  document.querySelectorAll('.character-sheet').forEach(e => e.remove());

}

function delete_by_id(id){
  if (document.getElementById(id))
    document.getElementById(id).remove();
}

atribute_string_to_array = function(control_word, check_for_eq_sign = false){
  //put something like: "2d8+d6+3-10", get array of this
  current_ingredient = "";
  rolls = [];

  for (let i=0; i < control_word.length; i++) {
      
      if (control_word[i] == "+") //Something will be added
      {
          rolls.push(current_ingredient);
          rolls.push("+");
          current_ingredient = "";
      } 
      else if (control_word[i] == "-")
      {
          rolls.push(current_ingredient);
          rolls.push("-");
          current_ingredient = ""; //Adding is default operation, sub is not, so i have to mark it.
      }
      else if (check_for_eq_sign && control_word[i] == "=")
      {
        rolls.push(current_ingredient);
        rolls.push("=");
        current_ingredient = "";
      }
      else //Current sing is not a separator
      {
          current_ingredient = current_ingredient.concat(control_word[i]);
      }
  }
  if (current_ingredient != "") rolls.push(current_ingredient);

 return rolls;
}

function is_element_with_class_on_page(classname){
  if (typeof classname != "string") return false;
  return document.querySelectorAll("div." + classname).length > 0;
}

const isAtLeast2dArray = (testingArray) => {
  if (!testingArray) return false;
  if (!Array.isArray(testingArray)) return false;

  return Array.isArray(testingArray[0]);
}

const createThrottling = (time = 100, callback) => {
  const defaultTime = 100;

  if (isNaN(time)) return;
  if (time < 0) time = defaultTime;

  let waiting = false;
  let cb = callback;
  let timeout = time;

  const throttle = () => {
      if (waiting) return;

      cb();
      waiting = false;
      setTimeout(function() {waiting = false}, timeout);
  }

  return throttle;

}

