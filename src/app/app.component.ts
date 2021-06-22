import EnjoyHint from "xbs-enjoyhint/src/enjoyhint";

import {
  Component
} from '@angular/core';
import {
  chatParser
} from './libs/parser';
import {
  metrices
} from './libs/metrices';

import $ from "jquery";
import anime from 'animejs/lib/anime.es.js';


import DataFrame, {
  Row
} from 'dataframe-js';

import Chart from '@toast-ui/chart';
import {
  BarChart
} from '@toast-ui/chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  show_stats = false;
  stats_data = {};
  user_card_data = {};

  ngOnInit() {

    //initialize instance
    var enjoyhint_instance = new EnjoyHint({});

    //simple config. 
    //Only one step - highlighting(with description) "New" button 
    //hide EnjoyHint after a click on the button.
    var enjoyhint_script_steps = [{
        'click .export_info': 'Export individual or group chat'
      },
      {
        'click .upload_btn': 'Click on this to upload the exported txt file and wait for the magic ❤️'
      }
    ];

    //set script config
    enjoyhint_instance.set(enjoyhint_script_steps);

    //run Enjoyhint script
    enjoyhint_instance.run();


    // Effect1 : topbar
    // Wrap every letter in a span
    var textWrapper = document.querySelector('.ml1 .letters');
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline({
        loop: true
      })
      .add({
        targets: '.ml1 .letter',
        scale: [0.3, 1],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 600,
        delay: (el, i) => 70 * (i + 1)
      }).add({
        targets: '.ml1 .line',
        scaleX: [0, 1],
        opacity: [0.5, 1],
        easing: "easeOutExpo",
        duration: 700,
        offset: '-=875',
        delay: (el, i, l) => 80 * (l - i)
      }).add({
        targets: '.ml1',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      });
    // 



  }

  effects() {


    // console.log("called");
    // effect 2: heading
    anime.timeline({
        loop: true
      })
      .add({
        targets: '.ml5 .line',
        opacity: [0.5, 1],
        scaleX: [0, 1],
        easing: "easeInOutExpo",
        duration: 700
      }).add({
        targets: '.ml5 .line',
        duration: 600,
        easing: "easeOutExpo",
        translateY: (el, i) => (-0.625 + 0.625 * 2 * i) + "em"
      }).add({
        targets: '.ml5 .ampersand',
        opacity: [0, 1],
        scaleY: [0.5, 1],
        easing: "easeOutExpo",
        duration: 600,
        offset: '-=600'
      }).add({
        targets: '.ml5 .letters-left',
        opacity: [0, 1],
        translateX: ["0.5em", 0],
        easing: "easeOutExpo",
        duration: 600,
        offset: '-=300'
      }).add({
        targets: '.ml5 .letters-right',
        opacity: [0, 1],
        translateX: ["-0.5em", 0],
        easing: "easeOutExpo",
        duration: 600,
        offset: '-=600'
      }).add({
        targets: '.ml5',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      });
    // 
  }
  ngOnDestroy() {
    sessionStorage.clear();
  }

  // call on txt file upload
  uploadFile(files) {
    var file = files[0];

    var fileReader = new FileReader();
    fileReader.readAsText(file);

    // 1. split text into a list of message
    // match combination for carriage return, line feed charachter for new line split
    const regexSplitNewLine = /(?:\r\n|\r|\n)/;
    var _this = this;
    fileReader.onloadend = function () {
      var textData = fileReader.result as string;
      sessionStorage.setItem('data', JSON.stringify(textData.split(regexSplitNewLine)));

      //Run parser, For now whatsapp parser. In future we can add more like telegram
      var obj_parser = new chatParser('whatsapp');
      var result = obj_parser.run();
      _this.show_stats = true;
      var metric_obj = new metrices(result);
      _this.stats_data = metric_obj.stats();
      _this.user_card_data = metric_obj.user_card();

      setTimeout(function () {

        // console.log(this.stats_data);  
        metric_obj.line_chart_day_month_year();
        metric_obj.bar_chart_hour();
        metric_obj.donut();
        metric_obj.radar_all_user();
        // metric_obj.create_word_cloud();
        metric_obj.create_graph();

      }, 10);

      setTimeout(function () {
        _this.effects();
      }, 1000);


    }


  }

}
