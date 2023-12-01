# LRO old version - Fullstack

This project is a first public commit of LRO. LRO is a project made for playing tabletop RPG with my friends online. This version is currently in use but I've stopped adding more functionalities to it. Repository of the newer version [here.](https://github.com/kajetan-szczurowski/LRO-new-version) *Link to demo at the bottom of the description.*

**Current version includes:**

 - working server (rolling, sending chat messages, moving character on the map), 
 - map with vertical and horizontal scrolling,
 - mini map on the corner of the normal map,
 - fullscreen map with zooming option,
 - moving avatar in map,
 - chat window with 3 types of messages,
 - rolling dice system.
 
 **Known bugs:**
 
 - hours and minutes in timestamps in chat messages sometimes display with an error like 7:60,
 - small screens are not supported (minimal screen width 850px),
 - character moving animation is buggy. Sometimes character stops moving before reaching it's destination. Animation also breaks in vertical (and almost vertical) trajectory.

 **TODO:**
 
 - fix known bugs,
 - change page layout to grid or flex.
 
 **Server Tech Stack:**
 
 - Node js,
 - Express js,
 - Axios,
 - Socket IO.
 
**Front Tech Stack:**
 - Socket IO.
 
To check demo version [click here.](https://lro-demo-009fff8aec4c.herokuapp.com) Basic controls below.
 - Click on character on map to activate it. Click to any other place on the map to trigger moving.
 - Move mouse pointer to any of the sides of the map. Hold shift to trigger map scrolling. Add left Alt to boost scrolling.
 - Click anywhere on the minimap. Map should jump to clicked destination.
 - Type anything on the chat input. Press enter to public message. You'll see  message based on your input.
 - Write some roll order and press enter. Rolls order are typed with template: #/dices and constants/ and optionally another #/roll comment/. Examples:
	 1. #d20 - roll 20-sided dice,
	 2. #d20 + 5 - roll 20-sided dice and add 5 to the result,
	 3. #d20 + 5 #Description - roll 20-sided dice and add 5 to the result. Corresponding message includes description.
	4. #2d20+5d4+21+42+d6-15.
	
 - Open demo version in another card of your browser. Initial position of the character on map is fixed but when you move character it should start moving on both cards to the same destination. Chat also supports server so site can be used as basic chat app.
 
 
  **Sources:**

  
 - [Character portait,](https://www.deviantart.com/hyptosis/art/200-Free-RPG-Portraits-for-Your-Game-679241770)
 - [used map,](https://dicegrimorium.com/pirate-port-dnd-battle-map/)
 - [website background.](https://dicegrimorium.com/ancient-pharaohs-tomb-entrance-dnd-battle-map/)

 
