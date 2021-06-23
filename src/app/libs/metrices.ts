//@collapse
// import three from "../libs/3d-force/three.js";
import * as Chartjs from "node_modules/chart.js/dist/chart.min.js"
import coseBilkent from 'cytoscape-cose-bilkent';



import cytoscape from 'cytoscape';


import * as _ from 'lodash';

import Chart from '@toast-ui/chart';
import {
  round
} from 'lodash';
import {
  utils
} from '../libs/utils'

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import $ from "jquery";

export class metrices {

  df = null;
  user_map = null;
  nodes_dict = null;
  utils_obj = null;
  day_name_order = {
    "Sunday": 1,
    "Monday": 2,
    "Tuesday": 3,
    "Wednesday": 4,
    "Thursday": 5,
    "Friday": 6,
    "Saturday": 7
  };

  month_name_order = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
  };

  // being lazzzzy
  hour_order = {
    '01': 1,
    '02': 2,
    '03': 3,
    '04': 4,
    '05': 5,
    '06': 6,
    '07': 7,
    '08': 8,
    '09': 9,
    '10': 10,
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,
    '16': 16,
    '17': 17,
    '18': 18,
    '19': 19,
    '20': 20,
    '21': 21,
    '22': 22,
    '23': 23,
    '24': 24,
  }
  constructor(df) {
    this.df = df;
    this.utils_obj = new utils();
    this.create_user_map();
  }


  line_chart_day_month_year() {
    var df = this.df;
    const groupedDname = df.groupBy('day_name');
    var group_day_name = (groupedDname.aggregate(group => group.count()).rename('aggregation', 'groupCount'));
    const groupedMname = df.groupBy('month_name');
    var group_month_name = (groupedMname.aggregate(group => group.count()).rename('aggregation', 'groupCount'));

    var dict_group_day_name = group_day_name.toDict();
    var dict_group_month_name = group_month_name.toDict();
    this.create_chart(dict_group_day_name, 'day_name', 'Weekday', 'chart1');
    this.create_chart(dict_group_month_name, 'month_name', 'Month', 'chart2');
  }

  create_chart(data_values, key, title_name, chart_id) {
    const el = document.getElementById(chart_id);
    if (title_name == 'Month') {
      var series_data = this.reorder_2_list(data_values, this.month_name_order, key);
    }
    if (title_name == 'Weekday') {
      var series_data = this.reorder_2_list(data_values, this.day_name_order, key);

    }
    const data = {
      categories: series_data[key],
      series: [{
        name: title_name + " data",
        data: series_data["groupCount"],
      }],
    };
    const options = {

      chart: {

        title: 'Total ' + title_name + "  chart",
        width: 500,
        height: 500
      },
      xAxis: {
        title: title_name,
      },
      yAxis: {
        title: 'count',
      },


    };

    const chart = Chart.lineChart({
      el,
      data,
      options
    });

    chart.setOptions({
      chart: {
        width: 'auto',
        height: 'auto',
      },
      legend: {
        align: "bottom",
        showCheckbox: false

      }
    });

    return chart;
  }

  create_line_chart_js(data_values, key, title_name, chart_id) {
    var canvas = < HTMLCanvasElement > document.getElementById(chart_id);
    var ctx = canvas.getContext('2d');
    var myChart = new Chartjs(ctx, {
      type: 'line',
      data: {
        labels: data_values[key],
        datasets: [{
          label: title_name,
          data: data_values['groupCount'],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title_name + ' Line Chart'
          }
        }
      }
    });
  }
  bar_chart_hour() {
    var df = this.df;
    const groupedDname = df.groupBy('hour');
    var group_hour = (groupedDname.aggregate(group => group.count()).rename('aggregation', 'groupCount'));

    var dict_group_hour = group_hour.toDict();
    this.create_bar_chart(dict_group_hour, 'hour', 'Hour', 'chart4');


  }

  create_bar_chart(data_values, key, title_name, chart_id) {
    const el = document.getElementById(chart_id);
    if (title_name == "Hour") {
      var series_data = this.reorder_2_list(data_values, this.hour_order, key)
    }
    const data = {
      categories: series_data[key],
      series: [{
        name: title_name + " data",
        data: series_data['groupCount'],
      }],
    };
    const options = {
      chart: {
        title: title_name,
        width: 500,
        height: 500
      },
    };

    const chart = Chart.columnChart({
      el,
      data,
      options
    });
    chart.setOptions({
      chart: {
        width: 'auto',
        height: 'auto',
      },
      legend: {
        align: "bottom",
        showCheckbox: false

      }
    });
  }

  donut() {
    var df = this.df;
    const groupedDuser = df.groupBy('from');
    var group_user = (groupedDuser.aggregate(group => group.count()).rename('aggregation', 'groupCount'));
    var dict_group_user = group_user.toDict();
    this.create_donut(dict_group_user, 'from', 'User', 'chart5');
  }

  create_donut(data_values, k, title_name, chart_id) {
    const el = document.getElementById(chart_id);
    var series_data = [];
    var total_score = _.sum(data_values['groupCount']);
    _.each(data_values[k], function (value, key) {
      var temp_dict = {
        name: value,
        data: round(data_values['groupCount'][key] / total_score * 100)
      };
      series_data.push(temp_dict);


    });

    const data = {
      categories: [title_name],
      series: series_data,
    };
    const options = {

      chart: {
        title: 'User',
        width: 600,
        height: 400
      },
      series: {
        radiusRange: {
          inner: '40%',
          outer: '100%',
        },
      },
    };

    const chart = Chart.pieChart({
      el,
      data,
      options
    });

    chart.setOptions({
      chart: {
        width: 'auto',
        height: 'auto',
      },
      legend: {
        align: "bottom",
        showCheckbox: true

      }
    });
  }

  create_user_map() {
    var df = this.df;
    var _this = this;

    var data_dict = df.toDict()
    var user_map = {};
    _.each(data_dict['from'], function (value, key) {
      if (!(value in user_map)) {
        user_map[value] = {
          "total_words": 0,
          "longest_message": 0,
          "avg_word": [],
          'first_message': null,
          "emojis": [],
          "message_count": 0,
          "hour": [],
          'last_message': null
        };
      }
      // console.log(user_map[value]);
      // console.log(user_map[value]["total_words"] +  data_dict["word_count"][key])
      user_map[value]["total_words"] = user_map[value]["total_words"] + data_dict["word_count"][key];
      user_map[value]["longest_message"] = data_dict["message_length"][key] > user_map[value]["longest_message"] ? data_dict["message_length"][key] : user_map[value]["longest_message"];
      user_map[value]["avg_word"].push(data_dict["word_count"][key]);
      if (data_dict["user_first_message"][key]) {
        user_map[value]["first_message"] = data_dict["timestamp"][key];
      }
      if (data_dict["emoji"][key] != null) {
        user_map[value]["emojis"] = (user_map[value]["emojis"]).concat(data_dict["emoji"][key]);
      }
      user_map[value]["message_count"] += 1;
      // avg of it we will consider peek hour
      user_map[value]["hour"].push(parseInt(data_dict["hour"][key]));
      user_map[value]["last_message"] = data_dict["timestamp"][key];
      // user_map[value]["day"].push(parseInt(data_dict["day"][key]));


    });
    _.forOwn(user_map, function (value, key) {
      user_map[key]["avg_word_count"] = round(_.mean(user_map[key]["avg_word"]));
      var emojis_list = user_map[key]["emojis"];
      // console.log();
      var counts = {};
      emojis_list.forEach((x) => {
        counts[x] = (counts[x] || 0) + 1;
      });
      // console.log(_.mapValues(_.invert(_.invert(counts)),parseInt));
      // sort by value rev
      counts = _(counts).toPairs().orderBy(1, 'desc').fromPairs().value()
      user_map[key]["emoji_count"] = counts;
      // console.log( counts[Object.keys(counts)[0]]);
      // var emo_key = Object.keys(counts)[0];
      // var emoji_obj = {};
      // emoji_obj[emo_key] = counts[Object.keys(counts)[0]]
      user_map[key]["most_used_emoji"] = Object.keys(counts)[0];
      // console.log(_.uniq(user_map[key]["day"]));
      // console.log((_.uniq(user_map[key]["day"])).length)
      // user_map[key]["days_spent"] = (_.uniq(user_map[key]["day"])).length;
      user_map[key]["days_spent"] = _this.utils_obj.date_diff(user_map[key]["first_message"], user_map[key]["last_message"]);
    });
    this.user_map = user_map;
  }

  user_card() {
    return this.user_map;
  }


  radar_all_user() {
    var df = this.df;
    const groupedMname = df.groupBy('from', 'month_name');
    var group_month_name = (groupedMname.aggregate(group => group.count()).rename('aggregation', 'groupCount'));

    var dict_group_month_name = group_month_name.toDict();

    const groupedDname = df.groupBy('from', 'day_name');
    var group_day_name = (groupedDname.aggregate(group => group.count()).rename('aggregation', 'groupCount'));
    var dict_group_day_name = group_day_name.toDict();
    this.create_radar(dict_group_month_name, 'from', 'Month', 'chart6');
    this.create_radar(dict_group_day_name, 'from', 'Weekday', 'chart7');

  }
  reorder_2_list(data, order, key_name) {

    var temp_count = new Array((data[key_name]).length);
    var temp_name = new Array((data[key_name]).length);

    _.each(data[key_name], function (value, index) {
      var insert_at = order[value] - 1;
      temp_name[insert_at] = value;
      temp_count[insert_at] = data["groupCount"][index]
    });
    var result = {
      groupCount: temp_count
    };
    result[key_name] = temp_name;
    return result;
  }
  reorder_data_(data_values, k, order_map, key_name) {
    var name_dict = {};
    var series_data = [];
    _.each(data_values[k], function (value, key) {
      // console.log(value);
      var insert_at = order_map[data_values[key_name][key]] - 1;
      // console.log(insert_at);
      if (!(value in name_dict)) {
        // console.log('in');
        // console.log((Object.keys(order_map)).length);

        name_dict[value] = _.fill(new Array((Object.keys(order_map)).length), 0);

      }
      // console.log(data_values['groupCount'][key]);
      name_dict[value][insert_at] = data_values['groupCount'][key];
    });
    _.forOwn(name_dict, function (value, key) {
      series_data.push({
        name: key,
        data: value
      })
    });

    return series_data;
  }

  create_radar(data_values, k, title_name, chart_id) {
    const el = document.getElementById(chart_id);


    if (title_name == 'Month') {
      var series_data = this.reorder_data_(data_values, k, this.month_name_order, 'month_name');
    }
    if (title_name == 'Weekday') {
      var series_data = this.reorder_data_(data_values, k, this.day_name_order, 'day_name');

    }
    const data = {
      categories: Object.keys(title_name == 'Month' ? this.month_name_order : this.day_name_order),
      series: series_data
    };
    const options = {
      chart: {
        title: title_name,
        width: 500,
        height: 500
        // width: 1000,
        // height: 1000
      },
      series: {
        showDot: true,
        showArea: false
      },
    };

    const chart = Chart.radarChart({
      el,
      data,
      options
    });
    chart.setOptions({
      chart: {
        width: 'auto',
        height: 'auto',
      },
      legend: {
        align: "bottom",
        showCheckbox: true

      }
    });
  }


  create_graph() {

    var nodes = [];
    var edges = [];
    var node_checked = [];
    var user_map = this.user_map;
    var id = 1;
    var id_map = {}
    _.forOwn(user_map, function (value, key) {
      _.each(user_map[key]["emojis"], function (value) {
        if (!node_checked.includes(value)) {


          nodes.push({
            data: {
              id: value,
              name: value
            }
          });
          node_checked.push(value);
          id++;
        }
      });

      if (!node_checked.includes(key)) {
        id_map[key] = id;
        nodes.push({
          data: {
            id: id,
            name: key
          }
        });
        id++;
      }
      var node_name = key;
      _.forOwn(user_map[key]["emoji_count"], function (value, key) {
        // console.log(id_map);
        // console.log(`${id_map[node_name]} --> ${key}`);
        edges.push({
          data: {
            id: id,
            source: id_map[node_name],
            target: key,
            weight: value
          }
        });
        id++;

      });


    });

    cytoscape.use(coseBilkent);




    var cy = cytoscape({
      container: document.getElementById('cy'),

      elements: {
        nodes: nodes,
        edges: edges
      },

      layout: {
      

        name: 'cose-bilkent',
        // Called on `layoutready`
        ready: function () {},
        // Called on `layoutstop`
        stop: function () {},
        // 'draft', 'default' or 'proof" 
        // - 'draft' fast cooling rate 
        // - 'default' moderate cooling rate 
        // - "proof" slow cooling rate
        quality: 'default',
        // Whether to include labels in node dimensions. Useful for avoiding label overlap
        nodeDimensionsIncludeLabels: false,
        // number of ticks per frame; higher is faster but more jerky
        refresh: 30,
        // Whether to fit the network view after when done
        fit: true,
        // Padding on fit
        padding: 10,
        // Whether to enable incremental mode
        randomize: true,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 20000,
        // Ideal (intra-graph) edge length
        idealEdgeLength: 150,
        // Divisor to compute edge forces
        edgeElasticity: 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
        nestingFactor: 0.1,
        // Gravity force (constant)
        gravity: 0.25,
        // Maximum number of iterations to perform
        numIter: 2500,
        // Whether to tile disconnected nodes
        tile: true,
        // Type of layout animation. The option set is {'during', 'end', false}
        animate: 'end',
        // Duration for animate:end
        animationDuration: 500,
        // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
        tilingPaddingVertical: 10,
        // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
        tilingPaddingHorizontal: 10,
        // Gravity range (constant) for compounds
        gravityRangeCompound: 1.5,
        // Gravity force (constant) for compounds
        gravityCompound: 1.0,
        // Gravity range (constant)
        gravityRange: 3.8,
        // Initial cooling factor for incremental layout
        initialEnergyOnIncremental: 0.5
      },

      style: [{
          selector: 'node',
          style: {
            'content': 'data(name)',
            'background-color': 'aqua',
            "opacity": 1,
            "height": function (node) {
              return 10 + node.indegree()
            },
            "width": function (node) {
              return 10 + node.indegree()
            },
            "shape": 'ellipse',
            "font-size": function (node) {
              return 10 + node.indegree()
            },
            // "min-zoomed-font-size": 12,
            "text-margin-y": -10,
            "color": '#ffcc00',
            "text-background-color": "#888",
            "text-background-opacity": 0.3,

          }
        },
        {
          selector: 'edge',
          style: {
            'target-arrow-shape': 'chevron',
            "curve-style": "unbundled-bezier",
            "control-point-step-size": 20,
            "control-point-weights": 0.5,
            'width': 1,
            'arrow-scale': .4,
            'padding': "1em",
            'target-distance-from-node': '5px',
            "line-color": "#f47a60",


          }
        },
        {
          selector: 'node.transparent',
          style: {
            'opacity': 0.1,
            'z-index': 1,
          }
        },
        {
          selector: 'edge.transparent',
          style: {
            'opacity': 0.001,
            'z-index': 1,
            'target-arrow-shape': "none",
          }
        },
        {
          selector: 'node.opaque',
          style: {
            'opacity': 1,
            'z-index': 9999999,
            "text-border-color": "#FED766",
          }
        },
        {
          selector: 'node.border',
          style: {
            'border-width': 3,
            'border-color': '#fc2a30',
            'border-opacity': 0.5,
          }
        },
        {
          selector: 'edge.opaque',
          style: {
            'opacity': 1,
            'z-index': 9999999,
            'target-arrow-shape': 'chevron',
          }
        }
      ],
      minZoom: 0.1,
      maxZoom: 2.5,
      motionBlur: false,
      pixelRatio: 'auto'
    });
    var timeouts = [];

    cy.on('mouseover', 'node', function (event) {
      cy.nodes(event.target).addClass('border');

      var time = setTimeout(function () {
        var selectedNodes = cy.nodes(event.target);
        var neighbor = selectedNodes.neighborhood();

        cy.elements().addClass('transparent');
        neighbor.addClass('opaque');
        selectedNodes.addClass('opaque');
      }, 1000);

      timeouts.push(time);

    });
    cy.on('mouseout', 'node', function () {

      for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      cy.elements().removeClass('transparent opaque border');
    });
  }


  updateHighlight(Graph) {

    Graph.nodeColor(Graph.nodeColor()).linkWidth(Graph.linkWidth()).linkDirectionalParticles(Graph.linkDirectionalParticles());
  }

  stats() {
    var user_map = this.user_map;
    var df = this.df;
    // console.log(this.user_map);
    // console.log(this.df);
    var total_user = (Object.keys(user_map)).length
    var total_message = 0;
    var longest_message_len = 0;
    var total_emoji_count = 0;
    var max_message_count = 0;
    var max_message_by = null;

    var total_word_count = 0;
    var longest_message_by = null;
    var emoji_addict = null;
    var emoji_count_of_addict = 0;

    _.forOwn(user_map, function (value, key) {
      total_message += value["message_count"];
      if (value["longest_message"] > longest_message_len) {
        longest_message_by = key;
        longest_message_len = value["longest_message"];
      }

      var emoji_used = (value["emojis"]).length;

      if (emoji_used > emoji_count_of_addict) {
        emoji_count_of_addict = emoji_used;
        emoji_addict = key;
      }

      total_emoji_count += emoji_used;
      total_word_count += value["total_words"];

      if (value["message_count"] > max_message_count) {
        max_message_by = key
        max_message_count = value["message_count"]
      }

    });
    var avg_message = round(total_message / total_user)

    var result = {
      total_user: total_user,
      total_message: total_message,
      longest_message_len: longest_message_len,
      longest_message_by: longest_message_by,
      total_emoji_count: total_emoji_count,
      total_word_count: total_word_count,
      max_message_count: max_message_count,
      max_message_by: max_message_by,
      emoji_addict: emoji_addict,
      emoji_count_of_addict
    };

    return result;
  }

  create_word_cloud() {
    var df = this.df;
    df = (df.select('message')).toDict();

    let chart = am4core.create("wordCloud", am4plugins_wordCloud.WordCloud);
    let series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());
    series.minWordLength = 5;
    series.maxCount = 400;
    series.minValue = 3
    console.log(this.user_map);
    series.excludeWords = Object.keys(this.user_map);
    series.text = _.toString(df['message']);


  }
}
