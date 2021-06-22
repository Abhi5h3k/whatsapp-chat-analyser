import DataFrame, {
  Row
} from 'dataframe-js';
import * as _ from 'lodash';
import {
  utils
} from '../libs/utils';

export class chatParser {

  parserType: string;
  regex_time_stamp = /(\d{1,4}[-/.] ?\d{1,4}[-/.] ?\d{1,4},?)/;
  regex_reference = /(@[0-9]+[.!?\\-]* | @[a-z]+[.!?\\-]*)/ig;
  regex_emoji = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;

  // map from -> to i.e user ref
  reference_map = {};
  // updated when user is found
  user_list: Array < string >= [];
  user_left = [];

  utils_obj = null;
  constructor(parserType: string) {
    this.parserType = parserType.toLowerCase();
    this.utils_obj = new utils();
  }

  run() {

    switch (this.parserType) {
      case 'whatsapp': {
        var result = this.whatsappParser();
        return result;
        break;
      }
      case 'telegram': {
        console.log('telegram');
        break;
      }
      default:
        console.log('Kindly provide parserType');
    }
  }

  private whatsappParser() {
    var listOfMessage = JSON.parse(sessionStorage.getItem('data'));
    // return listOfMessage;

    // var data = [[1,2,3],[4,5,6]];
    // var columns = ['v1','v2','v3'];
    // const df = new DataFrame(data, columns);
    // console.log(df);
    // 'emoji_count','link_count','is_system_message'
    const header = ['from', 'timestamp', 'time', 'message', 'message_length', 'word_count', 'user_first_message', 'emoji'];
    // 1.
    var _this = this;
    // list containing message split and joined broken message
    var updated_message_list = [];
    // is the current msg is a partial message part of prior msg
    var found_partial_message = false;

    _.forEach(listOfMessage, function (value) {
      var split_msg = _this.splitMessageBody(value);
      if (_this.is_partial_message(split_msg)) {
        found_partial_message = true;
      }

      if (found_partial_message && (!_.isEmpty(updated_message_list))) {
        var last_pushed = updated_message_list.pop();
        var last_message = last_pushed.pop();
        var concatenated_message = last_message.concat(_.join(_.concat(value), ' '));
        last_pushed.push(concatenated_message);
        updated_message_list.push(last_pushed);
        found_partial_message = false;
      } else {
        updated_message_list.push(split_msg);
      }


    });

    // console.log(updated_message_list);
    var data = [];
    _.forEach(updated_message_list, function (value) {
      // console.log(value);
      var row = [];
      if (!_this.is_system_message(value)) {
        // from
        var from = value[2];
        var user_first_message = false;
        if (!_this.user_list.includes(from)) {
          user_first_message = true;
        }
        _this.user_list.push(from);

        row.push(from);
        //to
        var to = null;
        if (_this.contains_reference(value[3])) {
          _this.update_reference_map(from, value[3])
        }
        // timestamp
        if (_this.is_time_stamp(value[0])) {
          var timestamp = value[0];
          if (timestamp.slice(timestamp.length - 1, timestamp, length) == ',') {
            timestamp = timestamp.slice(0, timestamp.length - 1);
          }
          row.push(timestamp);
        }
        // time
        row.push(value[1]);
        // message
        var message: string = _.last(value);
        row.push(message);
        // message length
        row.push(message.length)
        // word count
        row.push(message.split('').length);
        // user_first_message
        row.push(user_first_message);
        // emoji
        row.push(message.match(_this.regex_emoji));

        data.push(row);
      } else {
        _this.is_user_inactive(value);
      }



    });

    var df = new DataFrame(data, header);
    // console.log(df);
    df = this.utils_obj.dateOperations(df);
    // console.log(df);
    return df;
  }

  private is_user_inactive(value) {
    var msg: String = _.last(value);
    // var split_msg= msg.split(' ');
    // "last" -> len 4
    if (msg.slice(msg.length - 4, msg.length) == 'last') {

      var user_name = msg.slice(0, msg.length - 4);
      var user_found = _.find(this.user_list, function (user) {
        return user_name.match(/user/)
      });
      if (user_found != undefined) {
        this.user_left.push(user_found);

      }
      return true;
    } else return false;
  }

  private parse_time_stamp(timestamp: string) {

  }

  private contains_reference(msg: string) {
    // ! we grt number as reference, so should we show in graph?
    // refrence can be hard coded @name <-if someone types but dont reffer or @number <-default
    // so we will just check for @ ignoring email
    // regex_reference
    // [.!?\\-]* trailing punctuation example: @123123. hi
    // @[0-9]+ number
    //@[a-z]+   name
    // /(@[0-9]+[.!?\\-]* | @[a-z]+[.!?\\-]*)/ig
    var test_regex_reference = new RegExp(this.regex_reference);
    if (test_regex_reference.test(msg)) {
      // var match_count = (msg.match(test_regex_reference)).length;
      return true;
    } else {
      return false;
    }

  }

  private update_reference_map(from, msg) {
    var test_regex_reference = new RegExp(this.regex_reference);
    var user_refered = msg.match(test_regex_reference);

    if (from in this.reference_map) {
      this.reference_map[from] = _.concat(this.reference_map[from], user_refered);
    } else {
      this.reference_map[from] = user_refered;
    }
  }




  private is_time_stamp(time_stamp: string) {
    var test_time_stamp = new RegExp(this.regex_time_stamp);
    return test_time_stamp.test(time_stamp);
  }

  private is_system_message(msg: Array < string > ) {
    // !will update logics like his in future as type of data vary by region(diff region may have different format)
    if (msg.length != 4) {
      return true;
    }
  }

  private is_partial_message(msg: Array < string > ) {
    //!Assumption: If no timestamp then it's partial msg
    if (!this.is_time_stamp(msg[0]) || msg.length == 1) {
      // console.log(msg);
      // console.log(this.is_time_stamp(msg[0]));
      // console.log(msg.length);
      // console.log();
      return true;
    }
    return false;


  }

  private splitMessageBody(msg: string) {
    // (/^(\d{1,4}[-/.] ?\d{1,4}[-/.] ?\d{1,4})[,.]? \D*?(\d{1,2}[.:]\d{1,2}(?:[.:]\d{1,2})?)?/i
    // Break message string into : ['date','time','user','message']
    // todo: system message check
    // const regexSplit_message = /[,]\s(\d{1,2}[:]\d{1,2})\s[-]\s([^]*)[:]/i
    // var split_data = _.map(_.split(msg, regexSplit_message), _.trim);
    // return split_data;

    // split 1:
    var split1 = _.split(msg, '-', 2);
    // split 2
    var split2 = _.split(_.head(split1), ',', 2);
    // split 3
    var split3 = _.split(_.last(split1), ':');
    if (split3.length != 2) {
      split3 = _.slice(split3, 0, 1).concat([_.join(_.slice(split3, 1, split3.length), ':')]);
    }
    var split_data = _.compact(_.map(_.concat(split2, split3), _.trim));
    // console.log(split_data);
    return split_data;
  }




}
