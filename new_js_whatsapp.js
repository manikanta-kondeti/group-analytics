/*

TODO:
 Get each chat clicked and retrieve numbers(no: of messages total, and from you) 

Adding jQuery to console:
  var jq = document.createElement('script');
  jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
  document.getElementsByTagName('head')[0].appendChild(jq);
  //by image : .getElementsByClassName('chat-avatar')[0].getElementsByTagName('img')[0].src


  // Date: 
  message_system = document.getElementsByClassName('message-system');
  for(var i=0;i<message_system.length;i++) { var msg = message_system[i].getElementsByClassName('emojitext')[0]; console.log(msg.innerText); };

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
var timeline_values = []; 

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
  timeline_values = new Array(24).fill(0);
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
      timeline_values[extract_hour(time)-1] += 1; 
    }
    // Hour extraction for msg_out 
    for (var i=0; i<msg_out.length; i++) {
      var time = msg_out[i].getElementsByClassName('message-datetime')[0].innerText;
      timeline_values[extract_hour(time)-1] += 1;  
    }

  update_messages_by_you();
  print_list();  
}


var conversations = [];
var active_members =[];
var users = [];
// More concrete metrics : ( class: message-system)
function main() {
  var messages = document.getElementsByClassName('msg');
  var count = 0;
  var conv = [];
  active_members = [];
  conversations = [];
  while(count < messages.length-1) {
    var type_of_msg1 = get_type_of_msg_div(messages[count]);
    var type_of_msg2 = get_type_of_msg_div(messages[count+1]);
    
    if (type_of_msg1 == 'message' && type_of_msg2 == 'message'){

      var t1 = messages[count].getElementsByClassName('message-datetime')[0].innerText;
      var datetime2 = messages[count+1].getElementsByClassName('message-datetime');
      if (datetime2.length != 0) {
        var t2 = messages[count+1].getElementsByClassName('message-datetime')[0].innerText;
        conv_flag = get_time_diff(t1, t2, false);
      }
      else {
        conv_flag = false;
      }
      
      console.log("conv_flag = " + conv_flag + "  t1 = " + t1 + " t2 = " + t2);
      if (conv_flag == true) {
        console.log("Added messages");
        conv.push(messages[count]);
      }
      else if (conv_flag == false && conv.length > 10){
        console.log("conversation ended ");
        conversations.push(conv);
        conv = [];
      }
      else if (conv_flag == false && conv.length <= 10){
        console.log("conversation ended with not adding messages");
        conv = [];
      }
      count += 1;
    }
    else if(type_of_msg1 == 'ignore' || type_of_msg1 == 'date') {
      count += 1;
    }
    
    else if (type_of_msg1 == 'message' && type_of_msg2 == 'date') {
      var t1 = messages[count].getElementsByClassName('message-datetime')[0].innerText;
      var datetime2 = messages[count+1].getElementsByClassName('message-datetime');
      if (datetime2.length != 0) {
        var t2 = messages[count+1].getElementsByClassName('message-datetime')[0].innerText;
        conv_flag = get_time_diff(t1, t2, false);
      }
      else {
        conv_flag = false;
      }

    
      console.log("conv_flag = " + conv_flag + "  t1 = " + t1 + " t2 = " + t2);
      if (conv_flag == true) {
        console.log("Added messages");
        conv.push(messages[count]);
      }
      else if (conv_flag == false && conv.length > 10){
        console.log("conversation ended ");
        conversations.push(conv);
      }
      else if (conv_flag == false && conv.length <= 10){
        console.log("conversation ended without adding messages");
        conv = [];
      }
      count += 2;
    }

    else {
      count +=1;
    }
    
    // Last element iteration
    if (count == messages.length-2 && conv.length > 10){
      conversations.push(conv);
      conv = [];
    }
  }
  // Conversations separated 

  get_active_members();
  var conversations_count = [];
  var active_members_count = [];
  for (var i=0;i<conversations.length; i++){
    conversations_count.push(conversations[i].length);
  }
  for (var i=0;i<active_members.length; i++){
    active_members_count.push(active_members[i].length);
  }
  console.log(conversations_count);
  console.log(active_members_count);

  //End of method 
}


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
 * @param : null (input global conversations array)
 *    return :  list of active members in each conversation.
**/
function get_active_members() {
  for (var c=0; c<conversations.length; c++) {
    users = [];
    for (var i=0;i<conversations[c].length; i++) {
        var x = conversations[c][i].getElementsByClassName('number text-clickable');  
        if (x.length == 0) {
          var y = conversations[c][i].getElementsByClassName('text-clickable');  
          if (y.length != 0){
              // Actor update
              var you = conversations[c][i].getElementsByClassName('message-out');
              if ((y[0].innerText.search("AM") != -1  || y[0].innerText.search("PM") != 1 ) && you.length != 0)  {
                update_user("You");
              } 
              else {
                update_user(y[0].innerText);
              }
            }
          } 
        else {
            update_user(x[0].innerText);
          } 
      }
      // Add users to active memebrs list
      active_members.push(users);
  }
}


/**
 * @param : msg_div
 *    return : 'message' || 'datetime' || 'ignore'
**/
function get_type_of_msg_div(msg_div) {
  // check if its a date
  var children = msg_div.children;
  
  if (children.length == 1) {
    return 'date';
  }
  // Check if its a msg 
  else if (children.length == 2) {
    var temp = children[1];
    if (temp == undefined) {
      return 'ignore'
    }
    else {
      if (children[1].classList.contains('message-in') == true ||  children[1].classList.contains('message-out') == true) {
        return 'message'
      }
    }
  }
  return 'ignore';
}

/**
 *  @param :  timestamp1,2 as a input params 
 *     return : true ( if it is less than 1 hr), false(more than 1 hr)
**/
function get_time_diff(timestamp1, timestamp2, day_change) {
  var time1 = timestamp1.toString();
  var time2 = timestamp2.toString();
  // Split into hours and minutes 
  var hour1 = parseInt(time1.split(':')[0]);
  var temp1 = time1.split(':')[1];
  var minutes1 = parseInt(temp1.split(' ')[0]);  
  var M1 = temp1.split(' ')[1];
  var hour2 = parseInt(time2.split(':')[0]);
  var temp2 = time2.split(':')[1];
  var minutes2 = parseInt(temp2.split(' ')[0]);  
  var M2 = temp2.split(' ')[1];

  // Day Change and Validation
  if (day_change == true && ((M1 == "AM" && M2 == "AM") || (M1 == "PM" && M2 == "PM") || (M1 == "AM" && M2 == "PM"))) {
    return false;
  }
  if ((M2 == "AM" && M1 == "PM") || (M1 == "AM" && M2 == "PM")) {
    hour2 += 12;
    (hour2 >= 24) ? hour2 -= 12 : hour2;
    if (hour1 == 12) {
      hour1 = 0;
    }  
  }
  if (M1 == "AM" && M2 == "AM" && hour1 == 12) {
    hour1 = 0;
  }else if (M1 == "PM" && M2 == "PM" && hour1 == 12) {
    hour1 = 0;
  }
  if (M2 == "AM" && M1 == "AM" && hour2 == 12) {
    hour2 = 24;
  }else if (M2 == "PM" && M1 == "PM" && hour2 == 12) {
    hour2 = 24;
  }
  
  var timediff = ((60-minutes1) + (minutes2)) + (Math.abs(hour2 - hour1)-1) * 60;
 
  if (timediff > 60) {
    return false;
  }
  return true;
}



