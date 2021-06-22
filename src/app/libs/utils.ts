import DataFrame, {
  Row
} from 'dataframe-js';
import * as _ from 'lodash';

import * as moment from 'moment';

export class utils {
  constructor() {

  }

  dateOperations(df) {
    // 12/05/2020, 14:11
    // dd/mm/yyyy, 24:00
    var data_dict = this.date_time_formatter(df.toDict());
    return new DataFrame(data_dict);

  }

  date_time_formatter(column_data) {

    column_data['month'] = [];
    column_data['day'] = [];
    column_data['day_name'] = [];
    column_data['year'] = [];
    column_data['month_name'] = [];
    _.each(column_data['timestamp'], function (value) {

      var date__obj = moment(value, 'DD/MM/YYYY');
      var month = date__obj.format('M');
      var day = date__obj.format('D');
      var year = date__obj.format('YYYY');
      var day_name = date__obj.format('dddd');
      var month_name = date__obj.format('MMMM');
      column_data['month'].push(month);
      column_data['day'].push(day);
      column_data['year'].push(year);
      column_data['day_name'].push(day_name);
      column_data['month_name'].push(month_name);


    });
    column_data['hour'] = [];
    _.each(column_data['time'], function (value) {

      var date__obj = moment(value, 'hh:mm');
      var hour = date__obj.format('hh');

      column_data['hour'].push(hour);


    });
    return column_data;
  }

  date_diff(d1, d2) {
    var date__obj1 = moment(d1, 'DD/MM/YYYY');
    var date__obj2 = moment(d2, 'DD/MM/YYYY');

    return date__obj2.diff(date__obj1, 'days');
  }
}
