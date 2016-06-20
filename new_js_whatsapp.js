/*

TODO:
 Get each chat clicked and retrieve numbers(no: of messages total, and from you) 

Adding jQuery to console:
  var jq = document.createElement('script');
  jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
  document.getElementsByTagName('head')[0].appendChild(jq);
  //by image : .getElementsByClassName('chat-avatar')[0].getElementsByTagName('img')[0].src
*/

var chats = [], chats_array = [], full_chats = [], chat_divs = [], count = 0;;
var chats = 0, groups = 0, single_chats_array = [], groups_array = [], muted_groups = 0;
var body = document.getElementsByClassName('pane-body pane-list-body')[0];


/*
 * This method constructs a key and used it for identifying the object 
*/
function get_key(Object) {
  var key = "";
  //retrieve image source 
  var img = Object.getElementsByClassName('chat-avatar')[0].getElementsByTagName('img');
  if (img.length == 1) {
    key = key + img[0].src;
  }
  //retrieve title 
  var span = Object.getElementsByClassName('chat-title')[0].getElementsByTagName('span');
  if (span.length == 1) {
    key = key + span[0].title;
  }
  return key;
}


function check_duplicates(Object){
  for (var j=0; j<chats_array.length; j++) { 
    var key = get_key(Object);
    if (chats_array[j].key == key) {
      return "true";
    } 
  }
  return "false";
}


setInterval(function() { 
  if ((body.scrollTop + body.clientHeight != body.scrollHeight) && (groups == 0 && chats == 0)){
      scroll_content();
  }  else if( (body.scrollTop + body.clientHeight == body.scrollHeight) && count == 0) { 
    scroll_content(); count = 1; calculate_groups_and_chats();
  }
}, 1500);


function scroll_content() {
  console.log("Calculating... Please don't touch/scroll/click");
  chat_divs = document.getElementsByClassName('chat');
  for(var i=0; i<chat_divs.length; i++){
    // check if exists
    var status = check_duplicates(chat_divs[i]);
    if (status === "false") {
      var node = chat_divs[i];
      var object = {
        key : get_key(node),
        object : node
      }
      chats_array.push(object);
    }
  }
  body.scrollTop = body.scrollTop + 400;
}


function calculate_groups_and_chats() {
  for( i=0;i<chats_array.length; i++) {
    var obj = chats_array[i].object;
    // Check if it is a group or a chat 
    var id = obj.getAttribute('data-reactid');
    var type = id.search("g");

    if (type == -1) {
      chats = chats + 1;
      single_chats_array.push(chats_array[i]);
    }
    else {
      // Check for muted groups
      var muted = obj.getElementsByClassName('icon icon-meta icon-muted');
      if (muted.length != 0) {
        muted_groups = muted_groups + 1;
      }
      groups = groups + 1;
      groups_array.push(chats_array[i]);
    }
  }
  console.log("Number of groups = " + groups + " and number of chats = " + chats + " and number of muted groups = " + muted_groups);
}