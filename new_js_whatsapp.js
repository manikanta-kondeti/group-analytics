
  // Groups intended  : Dont touch or change or update 
  var conversations = [];
  var active_members =[];
  var users = [];
  var hbd_conversations = [];
  var first_user_contribution = [];
  var second_user_contribution = [];
  var third_user_contribution = [];
  var fourth_user_contribution = [];
  var first_user_names = [];
  var second_user_names = [];

  var name = "";
  var WEEKS = 0;
  var MONTHS = 0;
  var group_length;

  // More concrete metrics : ( class: message-system)
  function main(NAME, TOTAL_LENGTH, MONTHS_PASSED) {
    name = NAME;
    group_length = TOTAL_LENGTH;
    MONTHS = MONTHS_PASSED;
    WEEKS = MONTHS * 4;

    // re-initialize  
    hbd_conversations = [];
    active_members = [];
    conversations = [];
    users = [];
    first_user_contribution = [];
    second_user_contribution = [];
    third_user_contribution = [];
    fourth_user_contribution = [];
    first_user_names = [];
    second_user_names = [];

    var output_json_object = {};


    var messages = document.getElementsByClassName('msg');
    var count = 0;
    var conv = [];
   
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
        
        if (conv_flag == true) {
          // console.log("Added messages");
          conv.push(messages[count]);
        }
        else if (conv_flag == false && conv.length >= 10){
          // console.log("conversation ended ");
          add_conversation(conv)
          conv = [];
        }
        else if (conv_flag == false && conv.length < 10){
          // console.log("conversation ended with not adding messages");
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

        if (conv_flag == true) {
          //console.log("Added messages");
          conv.push(messages[count]);
        }
        else if (conv_flag == false && conv.length >= 10){
          // console.log("conversation ended ");
          add_conversation(conv);
        }
        else if (conv_flag == false && conv.length < 10){
          // console.log("conversation ended without adding messages");
          conv = [];
        }
        count += 2;
      }

      else {
        count +=1;
      }
      
      // Last element iteration
      if (count == messages.length-2 && conv.length >= 10){
        conversations.push(conv);
        conv = [];
      }
    }
    // Compute Active Members
    get_active_members();

    // Compute Greeting conversations 
    get_happy_birthday_conversations();

    // Compute User Contributions 
    get_users_contributions();

    // Final call
    print_metrics();
   
  }


  /**
   * @param : takes a single array of divs corresponsing to a conversation
   *    return : list of conversations
   */
  function add_conversation(single_conversation) {
    var length = conversations.length;
    if (length == 0) {
      conversations.push(single_conversation);
      return;
    }
    if (conversations[length-1].length != single_conversation.length) {
      conversations.push(single_conversation);
    }
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

  function get_users_contributions() {
    var users_before_sort = active_members;
    active_members = [];
    for (var i=0; i<users_before_sort.length; i++) {
        active_members.push(users_before_sort[i].sort(function(b, a){
           return a.messages-b.messages;
       })  
     );
       // console.log(active_members);
    }

    var total_messages = 0;
    // First user contribution 
    for (var i=0; i<active_members.length;i++) {
      total_messages = 0;
      for(var j=0; j<active_members[i].length; j++) {
          total_messages += active_members[i][j].messages;
      }
      if (active_members[i].length >= 4) {
        first_user_contribution.push(Math.round((active_members[i][0].messages*100)/total_messages));
        first_user_names.push(active_members[i][0].name);
        second_user_contribution.push(Math.round((active_members[i][1].messages*100)/total_messages));
        second_user_names.push(active_members[i][1].name);
        third_user_contribution.push(Math.round((active_members[i][2].messages*100)/total_messages));
        fourth_user_contribution.push(Math.round((active_members[i][3].messages*100)/total_messages));
      }
      else if (active_members[i].length == 3) {
        first_user_contribution.push(Math.round((active_members[i][0].messages*100)/total_messages));
        first_user_names.push(active_members[i][0].name);
        second_user_contribution.push(Math.round((active_members[i][1].messages*100)/total_messages));
        second_user_names.push(active_members[i][1].name);
        third_user_contribution.push(Math.round((active_members[i][2].messages*100)/total_messages));
        fourth_user_contribution.push(0);
      }
      else if (active_members[i].length == 2) {
        first_user_contribution.push(Math.round((active_members[i][0].messages*100)/total_messages));
        second_user_contribution.push(Math.round((active_members[i][1].messages*100)/total_messages));
        third_user_contribution.push(0);
        fourth_user_contribution.push(0);

        first_user_names.push(active_members[i][0].name);
        second_user_names.push(active_members[i][1].name);
      }
      else if (active_members[i].length == 1) {
        first_user_contribution.push(Math.round((active_members[i][0].messages*100)/total_messages));
        second_user_contribution.push(0);
        third_user_contribution.push(0);
        fourth_user_contribution.push(0);

        first_user_names.push(active_members[i][0].name);
        second_user_names.push("--no one--");
      }
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
   *  get happy birthday conversations 
   *  @param : null (global conversations array)
   *     return : [list of messages in each conversations with birthday tag]
  **/
  function get_happy_birthday_conversations() {
      hbd_conversations = [];
      var single_conversation = [];
      for (var i=0;i<conversations.length;i++) { 
        single_conversation = [];
        for(var j=0;j<conversations[i].length;j++) { 
          var c = conversations[i][j]; 
          if (c.getElementsByClassName('emojitext selectable-text').length == 1) {
            var message_text = c.getElementsByClassName('emojitext selectable-text')[0].innerText.toUpperCase();
      
            if (message_text.search('BIRTHDAY') != -1 || message_text.search('HAPPY RETURNS') != -1 || message_text.search('MANY MANY') != -1 || message_text.search('CONGRATS') != -1 || message_text.search('CONGRATULATIONS') != -1 || message_text.search('ANNIVERSARY') != -1 || message_text.search('WEDDING') != -1) {
              single_conversation.push(conversations[i][j]);
            }
          } 
        }
        if (single_conversation.length == 0) {
          hbd_conversations.push(0);
        }
        else {
          hbd_conversations.push(single_conversation.length);
        }
      }
    return hbd_conversations;
  }


  /** 
   * Get concrete metrics 
  **/
  function print_metrics() {
    var conversations_count = [];
    var active_members_count = [];

    // Get concrete metrics 
    for (var i=0;i<conversations.length; i++){
      conversations_count.push(conversations[i].length);
    }
    for (var i=0;i<active_members.length; i++){
      active_members_count.push(active_members[i].length);
    }

    output_json_object = {};
    output_json_object['name'] = name;
    output_json_object['total_members'] = new Array(conversations.length).fill(group_length);
    output_json_object['total_conversations'] = conversations.length;
    output_json_object['conversations'] = conversations_count;
    output_json_object['active_members'] = active_members_count;
    output_json_object['greeting_conversations'] = hbd_conversations;
    output_json_object['avg_conversations_per_week'] = Math.round(conversations.length/WEEKS);
    output_json_object['avg_conversations_per_month'] = Math.round(conversations.length/MONTHS);
    output_json_object['first_user_contribution'] = first_user_contribution;
    output_json_object['second_user_contribution'] = second_user_contribution;
    output_json_object['third_user_contribution'] = third_user_contribution;
    output_json_object['fourth_user_contribution'] = fourth_user_contribution;
    output_json_object['first_user_names'] = first_user_names;
    output_json_object['second_user_names'] = second_user_names; 

 /*   console.log("total_conversations = " + conversations.length + "\n" +
      "conversations = [" + conversations_count + "]" + "\n" +
      "active_members = [" + active_members_count + "]" + "\n" +
      "greeting_conversations = [" + hbd_conversations + "]" + "\n" +
      "avg_conversations_per_week = " + conversations.length/WEEKS + "\n" +
      "avg_conversations_per_month = " + conversations.length/MONTHS + "\n" +
      "first_user_contribution = [" + first_user_contribution + "]" + "\n" +
      "second_user_contribution = [" + second_user_contribution + "]" + "\n" +
      "third_user_contribution = [" + third_user_contribution + "]" + "\n" +
      "fourth_user_contribution = [" + fourth_user_contribution + "]");
*/
    console.log(JSON.stringify(output_json_object));
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