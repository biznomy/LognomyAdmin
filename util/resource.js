var resource = {
	menuItems:[
       {
       	id:'dashboard',
       	title:'Dashboard',
       	icon:'fa-th-large',
       	redirectTo:'p1=dashboard'
       },{
        id:'notifications',
        title:'Notifications',
        icon:'fa-bell',
        redirectTo:'p1=notifications'
       },{
       	id:'production',
       	title:'Production',
       	icon:'fa-ioxhost',
       	redirectTo:'p1=production&p2=apache',
       	subItems:[
           {
	       	id:'production_apache',
	       	title:'Apache',
	       	redirectTo:'p1=production&p2=apache'
	       },
	       {
	       	id:'production_tomcate',
	       	title:'Tomcate',
	       	redirectTo:'p1=production&p2=tomcate'
	       },{
	       	id:'production_mysql',
	       	title:'MySQL',
	       	redirectTo:'p1=production&p2=mysql'
	       }
       	]
       },{
        id:'querybuilder',
        title:'Create Query',
        icon:'fa-th-large',
        redirectTo:'p1=querybuilder'
       }
	],
  adminOption:{
      id:'admin',
      title:'Admin',
      icon:'fa-user',
      redirectTo:'p1=admin&p2=dashboard',
      subItems:[
       {
        id:'admin_dashboard',
        title:'Dashboard',
        redirectTo:'p1=admin&p2=dashboard'
       },
       {
        id:'admin_userform',
        title:'Users',
        redirectTo:'p1=admin&p2=users'
       },
       {
        id:'admin_userform',
        title:'Roles',
        redirectTo:'p1=admin&p2=roles'
       }
      ]
  },
	logsFields:{
		apache:[
      {field:"clientip",type:'term'},
      {field:"timestamp",type:'date'},
      {field:"verb",type:'term'},
      {field:"agent",type:'term'},
      {field:"bytes",type:'number'},
      {field:"response",type:'number'},
      {field:"geoip.country_name",type:'term'},
      {field:"message",type:'term'}
    ],
    tomcate:[],
    mysql:[]
	},
	iframe:[],
  queryInterval:'day',
  charts:{
    apache:[
      {
        title:'Status Code 301',
        statusCode:['404','401','301','500','200'],
        query:function(){
          var q = '{"size":0,"query":{"term":{"response":"301"}},"aggs":{"articles_over_time":{"date_histogram":{"field":"@timestamp","interval":"'+resource.queryInterval+'"}}}}';
          return q;
        },
        option:{
            chart: {
              type: 'column'
            },
            title: {text: ''},
            xAxis: {
                type: 'category',
                title: {
                    text: 'Days'
                }
            },
            yAxis: {
                title: {
                    text: 'Number of times'
                }
            },
            credits:false,
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        color: 'rgba(26, 179, 148, 0.64)'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span> <b>{point.y}</b> of total<br/>'
            },
            series: [{
                name: '301',
                color:'rgba(26, 179, 148, 0.64)',
                data: []
            }]
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations.articles_over_time.buckets;
          d[num].option.series[0].data=[];
          for(var i=0;i<result.length;i++){
             var date =  new Date(result[i].key),name='';
             if(resource.queryInterval == 'day'){
              var month = date.getMonth()+1 ; name =date.getDate() + "/" + month + "/" + date.getFullYear()
             }else if(resource.queryInterval == 'hour'){
               name =date.getHours() + ":" + date.getMinutes();
             }
              d[num].option.series[0].data.push({'name': name.toString(), 'y': result[i].doc_count});
          };
          callback();
        },
        setting:function(settingBox){
            var setting = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-wrench"></i></a><ul class="dropdown-menu dropdown-user " statusCodeList></ul>';
            settingBox.append(setting);
           var codeL = settingBox.find('[statusCodeList]');
            for(var i = 0; i < this.statusCode.length; i++) {
              codeL.append('<li><a>'+this.statusCode[i]+'</a></li>');
            }
        }
      },
      {
        title:'Numbers of  Hits/Day',
        statusCode:['year','month','week','day','hour','minute'],
        query:function(){
          var q = '{"size":0,"aggs":{"articles_over_time":{"date_histogram":{"field":"@timestamp","interval":"'+resource.queryInterval+'"}}}}';
          return q;
        },
        option:{
            title: {text: ''},
            xAxis: {
                type: 'category',
                title: {
                    text: 'Days'
                }
            },
            yAxis: {
                title: {
                    text: 'Number of times'
                }
            },
            credits:false,
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        color: 'rgba(26, 179, 148, 0.64)'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span> <b>{point.y}</b> of total<br/>'
            },
            series: [{
                name: 'Hits/Day',
                color:'rgba(26, 179, 148, 0.64)',
                data: []
            }]
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations.articles_over_time.buckets;
          d[num].option.series[0].data=[];
          for(var i=0;i<result.length;i++){
             var date =  new Date(result[i].key),name='';
             if(resource.queryInterval == 'day'){
              var month = date.getMonth()+1 ; name =date.getDate() + "/" + month + "/" + date.getFullYear()
             }else if(resource.queryInterval == 'hour'){
               name =date.getHours() + ":" + date.getMinutes();
             }
              d[num].option.series[0].data.push({'name': name.toString(), 'y': result[i].doc_count});
          };
          callback();
        },
        setting:function(settingBox){
           var setting = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-wrench"></i></a><ul class="dropdown-menu dropdown-user " statusCodeList></ul>';
            settingBox.append(setting);
           var codeL = settingBox.find('[statusCodeList]');
            for(var i = 0; i < this.statusCode.length; i++) {
              codeL.append('<li><a>'+this.statusCode[i]+'</a></li>');
            }
        }
      },
      {
        title:'Count of All Type Status',
        //query:'{"size":0,"query":{"range":{"@timestamp":{"gte":1475909431000}}},"aggs":{"response":{"terms":{"field":"response"}}}}',
        query:function(){
          var q = '{"size":0,"aggs":{"response":{"terms":{"field":"response"}}}}';
          return q;
        },
        option:{
            chart: {
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: ''
            },
            tooltip: {
                pointFormat: 'Count : <b>{point.y}</b>'
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        style: {
                            fontWeight: 'bold',
                            color: 'rgba(26, 179, 148, 0.64)'
                        }
                    },
                    startAngle: -90,
                    endAngle: 90
                }
            },
            series: [{
                type: 'pie',
                name: '',
                innerSize: '50%',
                data: []
            }]
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations.response.buckets;
          d[num].option.series[0].data=[];
          for(var i=0;i<result.length;i++){
            var clr = 'rgba(134, 8, 8, 0.54)';
              switch(result[i].key){
                case 200:
                  clr =  'rgba(26, 179, 148, 0.64)';
                break;
              }
              var Obj =  { name: result[i].key, y: result[i].doc_count ,color:clr};
              d[num].option.series[0].data.push(Obj);
          };
          callback();
        },
        setting:function(){
            var setting = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-wrench"></i></a><ul class="dropdown-menu dropdown-user "></ul>';
            
        }
      },
      {
        title:'Top 10 IP According to Hits',
        //query:'{"size":0,"query":{"range":{"@timestamp":{"gte":1475909431000}}},"aggs":{"response":{"terms":{"field":"response"}}}}',
        query:function(){
          var q = '{"size":0,"aggs":{"clientip":{"terms":{"field":"clientip"}}}}';
          return q;
        },
        option:{
             chart: {
                  type: 'pie',
                  options3d: {
                      enabled: true,
                      alpha: 45
                  }
              },
              title: {
                  text: ''
              },
              tooltip: {
                pointFormat: 'Count : <b>{point.y}</b>'
              },
              plotOptions: {
                  pie: {
                      dataLabels: {
                        style: {
                            fontWeight: 'bold',
                            color: 'rgba(26, 179, 148, 0.64)'
                        }
                      },
                      innerSize: 80,
                      depth: 40
                  }
              },
              series: [{
                  name: '',
                  data: []
              }]
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations.clientip.buckets;
          d[num].option.series[0].data=[];
          for(var i=0;i<result.length;i++){
              var Obj =  { name: result[i].key, y: result[i].doc_count};
              d[num].option.series[0].data.push(Obj);
          };
          callback();
        },
        setting:function(){
            var setting = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-wrench"></i></a><ul class="dropdown-menu dropdown-user "></ul>';
            
        }
      },
      {
        title:'Top 10 Countries By Hits',
        //query:'{"size":0,"query":{"range":{"@timestamp":{"gte":1475909431000}}},"aggs":{"response":{"terms":{"field":"response"}}}}',
        query:function(){
          var q = '{"size":0,"aggs":{"geoip.country_name":{"terms":{"field":"geoip.country_name"}}}}';
          return q;
        },
        option:{
             chart: {
                  type: 'pie',
                  options3d: {
                      enabled: true,
                      alpha: 45
                  }
              },
              title: {
                  text: ''
              },
              tooltip: {
                pointFormat: 'Count : <b>{point.y}</b>'
              },
              plotOptions: {
                  pie: {
                      dataLabels: {
                        style: {
                            fontWeight: 'bold',
                            color: 'rgba(26, 179, 148, 0.64)'
                        }
                      },
                      innerSize: 80,
                      depth: 40
                  }
              },
              series: [{
                  name: '',
                  data: []
              }]
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations['geoip.country_name'].buckets;
          d[num].option.series[0].data=[];
          for(var i=0;i<result.length;i++){
              var Obj =  { name: result[i].key, y: result[i].doc_count};
              d[num].option.series[0].data.push(Obj);
          };
          callback();
        },
        setting:function(){
            var setting = '<a class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-wrench"></i></a><ul class="dropdown-menu dropdown-user "></ul>';
            
        }
      },
      {
        title:'Top 10 Countries on map',
        type:'vectorMap',
        //query:'{"size":0,"query":{"range":{"@timestamp":{"gte":1475909431000}}},"aggs":{"response":{"terms":{"field":"response"}}}}',
        query:function(){
          var q = '{"size":0,"aggs":{"geoip.country_code2":{"terms":{"field":"geoip.country_code2"}}}}';
          return q;
        },
        option:{
          map: 'world_mill_en',
          backgroundColor: "transparent",
          regionStyle: {
              initial: {
                fill: '#e4e4e4',
                "fill-opacity": 0.9,
                stroke: 'none',
                "stroke-width": 0,
                "stroke-opacity": 0
              }
          },
          colors:{'in':'red'},
          series: {
            regions: [{
              values: {},
              scale: ["#1ab394", "#22d6b1"],
              normalizeFunction: 'polynomial'
            }]
          }
        },
        manageData:function(r,num,d,callback){
          var result = r.aggregations['geoip.country_code2'].buckets;
          d[num].option.series.regions[0].values={};
          for(var i=0;i<result.length;i++){
              var k =result[i].key,v= result[i].doc_count;
              k = k.toUpperCase();
              d[num].option.series.regions[0].values[k]=v;
          };
          callback();
        },
        setting:function(){
           
        }
      }
    ]
  }
}
