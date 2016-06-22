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
      scroll_content(); 
      count = 1; 
      calculate_groups_and_chats();
  }
}, 3000);


function scroll_content() {
  console.log("Calculating... Please don't touch/scroll/click");
  chat_divs = document.getElementsByClassName('chat');
  for(var i=0; i<chat_divs.length; i++){
    // check if exists
    var status = check_duplicates(chat_divs[i]);
    if (status === "false") {
      var node = chat_divs[i];
      var muted = node.getElementsByClassName('icon icon-meta icon-muted');
      mute_status = false;
      if (muted.length != 0) {
        mute_status = true;
      }
      var object = {
        key : get_key(node),
        object : node,
        mute_status : mute_status
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


// Group
var users = [], msg_in = [], msg_out = [];
var timeline_values = new Array(24).fill(0); 
function update_user(user_passed) {
  var user = user_passed.toString();
  // check if it exists 
  var user_index = -1;
  for (var i=0; i<users.length; i++) {
    if (users[i].name == user) {
      user_index = i;
      break;
    }
  }
  if (user_index == -1) {
    var object = {};
    object['name'] = user;
    object['messages'] = 1;
    users.push(object);
  } else {
    users[user_index]['messages'] += 1;
  }
}

/**
 * @param : text of time. 
 *   return : hour (integer)
 */
function extract_hour(time_passed) {
  var time = time_passed.toString();
  var hour_extraction = time.search(":");
  var hour_string = "";
  var offset = 0;
  var meridem = time.search("PM");
  if (meridem != -1) {
    offset = 12;
  } 
  for (var i=0; i<hour_extraction; i++){
    hour_string = hour_string + time[i];
  } 
  console.log("Hour String = " + hour_extraction + " hour string = " + hour_string);
  return parseInt(hour_string) + offset; 
}

function update_messages_by_you() {
  var object = {};
  object["name"] = "You";
  object['messages'] = msg_out.length;
  users.push(object);
}


function print_list() {
  users.sort(function(b, a){
      return a.messages-b.messages;
  })
  for (var i=0; i<users.length; i++) {
    console.log(users[i].name + " : " + users[i].messages);
  }

  console.log("Total messages : " + msg_in.length);
  console.log("Total timeline values : " + timeline_values);
}



/* TODO: Messages count:-  Total groups and activity in that groups (class: message_in,  message_out)
 *  @param: null
 *  return : object{messages_out : <int>, messages_out : <int>, muted_status : <boolean>} 
 */
function compute_activity() {
  users = [];
  msg_in = document.getElementsByClassName('message-in');
  msg_out = document.getElementsByClassName('message-out');
  

  for (var i=0; i<msg_in.length; i++) { 
    var x = msg_in[i].getElementsByClassName('number text-clickable');  
    if (x.length == 0) {
      var y = msg_in[i].getElementsByClassName('text-clickable');  
      if (y.length != 0){
          // Actor update 
          update_user(y[0].innerText);
        }
      } else {
        update_user(x[0].innerText);
      } 

      // Extract hours 
      var time = msg_in[i].getElementsByClassName('message-datetime')[0].innerText;
      console.log("Time = " + time + "Time extracted = " + extract_hour(time));
      timeline_values[extract_hour(time)-1] += 1; 
    }
  update_messages_by_you();
  
}
