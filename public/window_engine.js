class Window {
    constructor({
        id = "something",
        content = null,
        closing_button = false,
        window_style = "",
        header_style = "",
        title_style = "",
        title = "",
        draggable = false
      }={}) {
        
        this.id = id;
        this.content = content;
        this.content.id = id+"_content";
        this.closing_button = closing_button;
        this.window_style = window_style;
        this.header_style = header_style;
        this.title_style = title_style;
        this.title = title;
        this.draggable = draggable;

        //functional variables
        this.prepare_required = true;
        this.is_displayed = false;
        this.window_div;
        this.is_added_to_draggable_array = false;

        //variables for draggable windows
        if (this.draggable)
        { 
            this.pos1 = 0;
            this.pos2 = 0;
            this.pos3 = 0;
            this.pos4 = 0;
        }

      }

    create(){
        //Create every needed div and display it

        this.header_div = make_element_with_classes("div", this.header_style);
        let title_div = make_element_with_classes("div", this.title_style, this.title);
        this.header_div.append(title_div);


        let myself = this;
        if (this.closing_button)
        {
        let closing_button_div = make_element_with_classes('button', 'close-button');
        closing_button_div.innerHTML = "&times";
        closing_button_div.addEventListener("click", e => {
            myself.delete();
        })
        this.header_div.append(closing_button_div);     
        }

        //header is done, time to sandwich everything

        this.window_div = make_element_with_classes("div", this.window_style);
        this.window_div.id = this.id;

        if (this.draggable) 
        { 
            this.window_div.style.position = "absolute";
            this.window_div.style.left = "5px";
            this.window_div.style.top = "5px";
            //global storage
            if (!this.is_added_to_draggable_array)
                draggable_windows.push(this.id);

            this.is_added_to_draggable_array = true;
            //Prevention from many ids in array
        }

        this.window_div.append(this.header_div);
        this.window_div.append(this.content);
        this.display();

    }

    display(){

        if (!this.is_displayed){
            document.body.appendChild(this.window_div);
            this.is_displayed = true;
            
            //scroll to bottom
            this.content.scrollTo(0, this.content.scrollHeight);
            if (this.draggable) this.header_div.onmousedown = drag_window;

        }
    }

    delete(){
        delete_by_id(this.id);
        this.is_displayed = false;
    }

    refresh_content(new_content){
        //hide - remove old content - insert new content - display

        this.delete();
        if (document.getElementById(this.content.id))
            this.window_div.removeChild(document.getElementById(this.content.id));
        this.content = new_content;
        this.window_div.append(this.content);
        this.display();

    }

}

    drag_window = (e) =>{
        let pos1, pos2, pos3, pos4; //Position for dragging window

        // First - determine what window is clicked
        let clicked_objects = document.querySelectorAll( ":hover" );
        let my_id;
        
        clicked_objects.forEach(object =>{
            if (object.id) my_id = object.id;
            //Sometimes in future 
        });

        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;

        let current_window = document.getElementById(my_id);

        document.onmousemove = (e) => 
            {
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            // set the element's new position:

            current_window.style.left = (current_window.offsetLeft - pos1) + "px";
            current_window.style.top = (current_window.offsetTop - pos2) + "px";
            };

        document.onmouseup = (e) =>
        { 
            document.onmouseup = null;
            document.onmousemove = null;
        }
    };

        



