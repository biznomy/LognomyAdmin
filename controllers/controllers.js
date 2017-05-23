var controller = {
	dashboard:{
		init:function(elm){
      $(elm).find('[dashboard]').empty();
      var d = resource.iframe;
      for(var i=0;i<d.length;i++){
        var chart = '<div class="col-lg-6"><div class="ibox "><div class="ibox-title"><h5>'+d[i].title+'</h5><div class="ibox-tools"><a class="collapse-link"><i class="fa fa-chevron-up"></i></a><a class="close-link"><i class="fa fa-times"></i></a></div></div><div class="ibox-content iframe"><iframe src="'+d[i].link+'" height="400"></iframe></div></div></div>';
        $(elm).find('[dashboard]').append(chart);
      }
		}
	},
  querybuilder:{
    init:function(elm,p){
      var self =this;
        self.logsTypeChange('apache');
        elm.find('[name="queryFor"]').on('change',function(){
          var t = $(this).val();
          self.logsTypeChange(t);
          self.listRender(elm,t);
        });
        self.listRender(elm,'apache');
        elm.find('[log-action]').off('click').on('click',function(){
          var fun = $(this).attr('log-action');
          if(fun){
            self[fun](elm,$(this));
          }
        });
    },
    logsTypeChange:function(t){
      var scope = angular.element($("#bodyContentQueyBuilder")).scope();
      scope.$apply(function () {
        queryBuilder['fields']={};
        var d = resource.logsFields[t];
         if(d && d.length > 0){
            for(var i=0;i<d.length;i++){
               queryBuilder['fields'][d[i].field] = d[i];
            }
         }
         scope.setFields();
      });
    },
    listRender:function(elm,tpy,val){
      var self = this,qyr = {"query":{"match":{"queryFor": tpy} }},dele = '<button class="btn-danger btn btn-xs pull-right" data-toggle="tooltip" data-placement="top" title="Delete" log-action="deleteQuery"><i class="fa fa-trash"></i></button>';
      if(val && val != ''){
        qyr = {"query":{"and":[{"match":{"queryFor": tpy} },{ "match": { "description": val}}]}};
        dele = '';
      }
      service.getQueries(qyr,function(d){
        var data = d.hits.hits,cntr = elm.find('[queryList] [queryListCounter]'),box = elm.find('[queryList] [queryListBox]');
        box.empty();cntr.text(d.hits.total);
        if(d.hits.total > 0){
            for(var i = 0; i < data.length; i++) {
               var qry=data[i]._source,view = '<div index="'+i+'" id="'+data[i]._id+'" class="feed-element" data-dismiss="modal"><div class="media-body "><strong>Type :</strong>'+qry.queryFor+'<br><strong>Description : </strong>'+qry.description+'&nbsp;&nbsp;'+dele+'</div></div>';
               box.append(view);
            }

            if(elm.find('#myModal4').length > 0){
              box.find('.feed-element').on('click',function(){
                  controller.production.logs.advanceSearch(this,tpy,data);
              });
            }else{
              box.find('button.btn-danger').on('click',function(){
                  var row = $(this).closest('.feed-element'),id = row.attr('id');
                  service.deleteQuery(id,function(){
                    setTimeout(function(){
                      self.listRender(elm,tpy,val);
                    },1000);
                  });
              });
            }               
        }else{
          var view = '<div class="feed-element"><div class="media-body ">Zero Content Found</div></div>';
           box.append(view);
        }
      });
    },
    getQuery:function(c){
         var q = queryBuilder.currentQuery;
         return c(q);
    },
    saveQuery:function(elm,me){
      var self =this;
      self.getQuery(function(q){
          var des = elm.find('[name="description"]').val(),
          tpy = elm.find('[name="queryFor"]').val(),
          data = {description:des,queryFor:tpy,query:q};
          service.saveQuery(data,function(res){
            setTimeout(function(){
              self.listRender(elm,tpy);
            },1000);
          })
      });
    }
  },
  admin:{
    init:function(elm,p){
      var self = this;
      self[p.p2].init(elm,p);
    },
    dashboard:{
      init:function(elm,p){
        service.shield.get('user',function(r){
          $(elm).find('[usersCounter]').text(Object.keys(r).length);
        });
        service.shield.list('role',function(r){
          $(elm).find('[rolesCounter]').text(Object.keys(r).length);
        });
      }
    },
    users:{
      init:function(elm,p){
        service.shield.get('user',function(users){
          var box = $(elm).find('.usersList');
          box.empty();
           for(var k in users){
              var user = users[k];
                 if(!user.full_name){user.full_name ='None'};
                 if(!user.email){user.email ='None'};
                 if(!user.metadata.mobile){user.metadata.mobile ='None'};
                var view='<div class="col-lg-3 animated fadeInUp"> <div class="ibox"><div class="ibox-content"><p>Name : '+user.full_name+'</p> <p>Username : '+user.username +'</p><p>Role : '+user.roles.toString()+'</p><p>Email : '+user.email +'</p><small>Mobile : '+user.metadata.mobile+'</small></div></div> </div>';
              box.append(view);
           }
        });
      }
    },
    roles:{
      init:function(elm,p){
        service.shield.get('role',function(roles){
          var box = $(elm).find('.rolesList');
           box.empty();
           for(var k in roles){
              var role = roles[k],
               names=role.indices.length > 0?role.indices[0].names.toString():'None',
               privileges = role.indices.length > 0?role.indices[0].privileges.toString():'None';
              var view='<div class="col-lg-3 animated fadeInUp"> <div class="ibox"><div class="ibox-content"><p>Name : '+k+'</p> <p>Indices : '+ names +'</p><p>Privileges : '+ privileges +'</p></div></div> </div>';
              box.append(view);
           }
        });
      }
    },
    userform:{
      init:function(elm,p){
        $(elm).find('[type="submit"]').on('click',function(){
            var fields = $(elm).find('[name]'),data={metadata:{}};
            for(var i=0;i<fields.length;i++){
              var k = $(fields[i]).attr('name'),v = $(fields[i]).val();
              if(v != ''){
                if(k == 'mobile'){
                   data.metadata[k]=v;
                }else if(k == 'roles'){
                  data[k]=v.split(',');
                }else{
                  data[k]=v;
                }
              }else{
                load.alert.open(elm,'All fields required ','alert-danger');
                return '';
              }
            }
            var username = data.username;
            delete data.username;
            service.shield.save('user/'+username,data,function(r){
              load.alert.open(elm,'New User '+username+' created','alert-success');
              load.changePage('p1=admin&p2=userform');
            });
        });
      }
    }
  },
  notifications:{
    init:function(elm,p){
      var to = new Date().getTime(),results=20,i = new Date(),
      //from = i.setMinutes(i.getMinutes() - 5);
      //from = i.setHours(i.getHours() - 2);
      from = i.setDate(i.getDate() - 30);
      service.watch.history.getByTimeRange(from,to,function(r){
          if(r.hasOwnProperty('hits')){
            var notification = $(elm).find('[lognomy-notification]'),list = notification.find('.notificationList');
            if(r.hits.total < 1){return '';}
            list.empty();
            results = r.hits.total < results?r.hits.total:results;
            for (var i = 0; i < results; i++) {
              var d=r.hits.hits[i]._source,
               date = new Date(d.trigger_event.triggered_time),
               msg = d.result.input.payload?d.result.input.payload.hits.total:d.result.input.status;
               li='<div class="col-lg-3 animated fadeInUp"> <div class="ibox"><div class="ibox-content"><h5>'+d.watch_id+'</h5> <h4>Status : '+msg+'</h4>'
                  +'<div class="stat-percent font-bold text-navy">'+date.getHours()+':'+date.getMinutes()+' <i class="fa fa-clock-o"></i></div><small>'+date.getDate()+'/'+date.getMonth()+'/'+date.getFullYear()+'</small></div></div> </div>';
              list.append(li);
            }
          }
      },results);
    }
  },
	production:{
		init:function(elm,p){
			var self = this;
			if(!p.p3){p['p3'] ='analytics'}
			$(elm).find('[tabname]').removeClass('active');
		    $(elm).find('.tab-pane').removeClass('active');
			$(elm).find('[tabname="'+p.p3+'"]').addClass('active');
			$(elm).find('#'+p.p3).addClass('active');
			self.callActiveTab(elm,p,'init');
		},
		callActiveTab:function(elm,p,fun){
      switch(p.p3){
				case 'alarms':
          this.alarms[fun](elm,p);
				break;
				case 'logs':
          this.logs[fun](elm,p);
				break;
				default:
          this.analytics[fun](elm,p);
				break;
			}
		},
		analytics:{
		   init:function(elm,p){
          var chartsBox = $(elm).find('[analyticsCharts]');
	        chartsBox.empty();
          var d = resource.charts[p.p2];
          if(d && d.length > 0){
            for(var i=0;i<d.length;i++){
              var chart = '<div class="col-lg-6" iframe><div class="ibox "><div class="ibox-title"><h5>'+d[i].title+'</h5><div class="ibox-tools" chartSetting><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></div></div><div class="ibox-content "><div style="height: 300px;" iframeBox></div></div></div></div>';
              chartsBox.append(chart);
            };
            var charts = chartsBox.find('[iframe]');
            this.renderCharts(charts,0,d);
          }
      },
      renderCharts:function(charts,num,d){
          var self = this,settingBox;
          if(num < charts.length){
            settingBox = $(charts[num]).find('[chartSetting]');
            d[num].setting(settingBox);
            controller.production.service('logstash*',JSON.parse(d[num].query()),function(r){
              if(!r.aggregations){return '';};
              d[num].manageData(r,num,d,function(){
                if(!d[num].hasOwnProperty('type')  && d[num].type != 'vectorMap'){
                   $(charts[num]).find('[iframeBox]').highcharts(d[num].option);
                }else{
                   $(charts[num]).find('[iframeBox]').vectorMap(d[num].option);
                }
                num++;
                self.renderCharts(charts,num,d);
              });
            },'bodySearch');
          }
      }
  	},
		logs:{
		   size:10,
		   livetail:{
		   		intervalTime:5000,
		   		instance:null
		   	},
		   query:{
		   	"sort" : [
			        {"@timestamp" : {"order" : "desc"}}
			   ],
			  "from": 0,
        "size": 10
		   },
       tempQueryData:[],
		   init:function(elm,p){
		   	  var self = this;
		   	  self.query.size = self.size;
	          self.renderLogs(elm,p);
	          $(elm).find('.parseUnparsedLogs label[type]').off().on('click',function(){
	          	 var t =$(this).attr('type'),tbl = $(elm).find('.logtableview');
	          	 if(t=='parsed'){$(tbl).addClass(t).removeClass('unparsed');}else{
	          	 	$(tbl).addClass(t).removeClass('parsed');
	          	 }
	          });

            var optn = { keyboardNavigation: false, forceParse: false,autoclose: true};

            function dateRangeSearch(t,Obj){
               if(!Obj[t] || Obj[t] == ''){return '';}
                if(self.query.hasOwnProperty('filter')){
                  if(self.query.filter.hasOwnProperty('and')){
                    self.query.filter ={};
                  }
                  if(self.query.filter.hasOwnProperty('range')){
                     self.query.filter.range["@timestamp"][t] = Obj[t];
                  }else{
                     self.query.filter['range']= {"@timestamp":Obj};
                  }
                }else{
                  self.query['filter'] = {'range':{"@timestamp":Obj}};
                }
                self.query.filter.range["@timestamp"]["format"] = "MM/dd/yyyy";
                self.renderLogs(elm,p);
            };

	          $('#datepicker input[name="start"]').datepicker(optn)
            .on('hide',function(){
                var val = $(this).val();
                dateRangeSearch('gte',{"gte": val});
            });
            $('#datepicker input[name="end"]').datepicker(optn)
            .on('hide',function(){
                var val = $(this).val();
                dateRangeSearch('lte',{"lte": val});
            });
           
	          if(self.livetail.instance){
                 $(elm).find('[log-action="livetailToggle"]').toggleClass('on off');
           	 }
      },
      renderLogs:function(elm,p){
       	  var arr = resource.logsFields[p.p2],
       	      hdr = $(elm).find('#logsH'),
       	      bdy = $(elm).find('#logsB'),
       	      self = this;
       	  $(hdr).empty();$(bdy).empty();
       	  $(hdr).append('<th style="width:130px;"><input type="checkbox" class="i-checks" name="input[]"></th>');
       	  for(var i = 0; i < arr.length; i++) {
              var cls = 'parsedfields',fieldN = arr[i].field;
              if(fieldN == 'timestamp'){cls = '';};
              if(fieldN == 'message'){cls = 'unparsedfields';};
              $(hdr).append('<th class="'+cls+'">'+fieldN+'</th>');
		      }
		      $(hdr).append('<th>Action</th>');
           	  controller.production.service('logstash-apache2-*',self.query,function(r){
                    var d = r.hits.hits;
                    for(var i = 0; i < d.length; i++) {
                       var _src = d[i]['_source'],
                        str1 = _src.hasOwnProperty('favourite') && _src.favourite?'t-d-g':'',
                        str2 = _src.hasOwnProperty('userComment') ?'t-d-g':'';
                       var row = '<tr indexno="'+i+'" id="'+d[i]._id+'" _index="'+d[i]._index+'" _type="'+d[i]._type+'" class="logsrow animated fadeInUp"><td><input type="checkbox" class="i-checks" name="input[]"><button class="btn-primary btn btn-xs '+str1+'" log-action="toggleFavourite"><i class="fa fa-star"></i></button><button class="btn-primary btn btn-xs '+str2+'"" log-action="addComment" indexno="'+i+'"><i class="fa fa-comment"></i></button></td>';
    		           	   for(var j = 0; j < arr.length; j++) {
    		           	   	    var cls = 'parsedfields',k = arr[j].field,msgId='';
                            if(k.split('.').length > 1){
                              t = _src.hasOwnProperty(k.split('.')[0])?_src[k.split('.')[0]][k.split('.')[1]]:'None';
                            }else{
                             t= _src[k];
                            }
    			                if(k == 'timestamp'){cls = 'fixedfields';};
    			                if(k == 'message'){cls = 'unparsedfields'; msgId = 'id="copylogmsg'+i+'"';};
    		           	   	    row = row + '<td class="'+cls+'" '+msgId+'>'+t+'</td>';
    		           	   }
    		           	   var href = "href='https://mail.google.com/mail/?view=cm&fs=1&tf=1&body="+_src.message+"'",comn ='class="btn-primary btn btn-xs" data-toggle="tooltip" data-placement="top"',
    		           	   del = '<button '+comn+' title="Delete" log-action="deleteLog"><i class="fa fa-trash"></i></button>',
    		           	   view = '<button '+comn+'title="View Detail" log-action="viewLog"><i class="fa fa-eye"></i></button>',
    		           	   share = '<a '+comn+'title="Share" target="_blank" '+href+'><i class="fa fa-mail-forward"></i></a>',
    		           	   copy = '<button '+comn+'title="Copy" data-clipboard-target="#copylogmsg'+i+'" ><i class="fa fa-copy"></i></button>';
    		           	   row = row + '<td style="width:100px;"> '+del+share+' </td></tr>';
    		           	   $(bdy).append(row);
    		           	}
                    self.bindEvents(elm,p);
                    var cal='', tl = self.query.size;
                    $(elm).find('[log-action="loadMore"]').removeClass('disabled');
                    if(self.query.size > r.hits.total){
                      tl = r.hits.total;
                      $(elm).find('[log-action="loadMore"]').addClass('disabled');
                    }
                    cal = 'Showing 1 to '+tl+' of '+r.hits.total+' logs';
                    $(elm).find('#logsCountingStatus').text(cal);
	          },'bodySearch');
           },
           bindEvents(elm,p){
           	    var self = this;
           	    $(elm).find('.i-checks').iCheck({
	                checkboxClass: 'icheckbox_square-green',
	                radioClass: 'iradio_square-green',
	            });
	            $(elm).find('[log-action]').off('click').on('click',function(){
	            	var tr = $(this).closest('tr.logsrow'),fun = $(this).attr('log-action');
	            	if(fun){
	            		var Obj=null,cls =$(this).hasClass('t-d-g');
	            		if(tr){Obj={},Obj['id'] = $(tr).attr('id'),Obj['_type'] = $(tr).attr('_type'),Obj['_index'] = $(tr).attr('_index');}
	            	    self[fun](elm,cls,$(this),Obj,p);
	            	}
	            });
           },
           livetailToggle:function(elm,sltd,me,Obj,p){
           	 var status = $(me).hasClass('on'),self = this,interval = self.livetail.intervalTime;
           	 if(self.livetail.instance){
                 clearInterval(self.livetail.instance);self.livetail.instance=null;
           	 }
           	 if(!status){
               self.livetail.instance = setInterval(function(){
                   self.renderLogs(elm,p);
                },interval);
           	 }
           	 $(me).toggleClass('on off');
           },
           loadMore:function(elm,sltd,me,Obj,p){
           	   var self = this;
               self.query.size = self.query.size + self.size;
               self.renderLogs(elm,p);
           },
           toggleFavourite:function(elm,sltd,me,Obj,p){
           	 var self = this;sltd = !sltd;
             controller.production.service(Obj._index+'/'+Obj._type+'/'+Obj.id,{"favourite":sltd},function(r){
                  setTimeout(function(){
                      self.renderLogs(elm,p);
                  },1000);
	          },'partialUpdate');
           },
           addComment:function(elm,sltd,me,Obj,p){
             var index = $(me).attr('indexno'),html = '<tr class="log'+index+'Comment animated fadeInDown"><td colspan="'+resource.logsFields.apache.length+'"><form class="form-inline"><textarea style="width:80%;" type="text" placeholder="enter comment" class="form-control"/> <a class="btn btn-primary btn-sm" id="saveComment">Save</a></form> </td></tr>';
             var r = $(elm).find('tbody > tr.log'+index+'Comment'),selectedRow = $(elm).find('tbody > tr[indexno="'+index+'"]');
             if(r.length < 1){
             	$(selectedRow).after(html);
             }else{
             	$(r).toggleClass('fadeInDown fadeOutUp hidden-elm');
             }
             if(r.length < 1){
             	r = $(elm).find('tbody > tr.log'+index+'Comment');
                $(r).find('#saveComment').off('click').on('click',function(){
                    var val = $(r).find('textarea').val();
                    if(val != ''){
                        controller.production.service(Obj._index+'/'+Obj._type+'/'+Obj.id,{"userComment":val},function(rslt){
	                     $(r).toggleClass('fadeInDown fadeOutUp hidden-elm');
	                     var btn =$(selectedRow).find('button[log-action="addComment"]'); 
                         $(btn).addClass('t-d-g');
		                },'partialUpdate');
	                }
                });
             }
             
             if(!$(r).hasClass('hidden-elm') || r.length < 1){
     			    controller.production.service(Obj._index+'/'+Obj._type+'/'+Obj.id,'',function(data){
                  if(data._source.hasOwnProperty('userComment')){
                  	$(r).find('textarea').val(data._source.userComment);
                  }else{
                  	$(r).find('textarea').val('');
                  }
	            },'getDocById');
         	 }
           },
           filterByStar:function(elm,sltd,me,Obj,p){
           	    $(me).toggleClass('t-d-g');
           	    var t = $(me).hasClass('t-d-g');
	           	if(t){
           	    	this.query['query']= {"match": { "favourite":t}};
           	    }else{
           	    	delete this.query.query;
           	    }
	           	this.renderLogs(elm,p);
           },
           filterByComment:function(elm,sltd,me,Obj,p){
           	   $(me).toggleClass('t-d-g');
           	    var t = $(me).hasClass('t-d-g');
	           	if(t){
           	    	this.query['filter']= {"exists": {"field": "userComment"}};
           	    }else{
           	    	delete this.query.filter.exists;
           	    }
	           	this.renderLogs(elm,p);
           },
           searchByQuery:function(elm,sltd,me,Obj,p){
           	  var v = $(elm).find('#searchinall').val();
           	  if(v && v != ''){
           	  	this.query['query']= {"match": { "_all": v}};
           	  }else if(this.query.hasOwnProperty('query')){
                delete this.query['query'];
           	  }
           	  this.renderLogs(elm,p);
           },
           deleteLog:function(elm,sltd,me,Obj,p){
           	var self = this;
           	swal({
    		        title: "Are you sure?",
    		        text: "You will not be able to recover this log!",
    		        showCancelButton: true,
    		        confirmButtonColor: "#1ab394",
    		        confirmButtonText: "Yes, delete it!",
    		        showLoaderOnConfirm: true
    		    }, function () {
              service['delete'](Obj._index+'/'+Obj._type+'/'+Obj.id,'',function(r){ 
                  self.renderLogs(elm,p);
              },function(r){
                  console.log(r);
              });
		        });
           },
           viewLog:function(elm,sltd,me,Obj){
            
           },
           advanceSearch:function(elm,tpy,data){
              var index = $(elm).attr('index');
              index = Number(index);
              this.query['filter'] = {'and':data[index]._source.query.filter.and};
              console.log(data[index]._source.query.filter.and);
              console.log(this.query);
              $('#datepicker input').val('');
	            this.renderLogs($('#bodyContent'),{p2:tpy});
           },
           advanceSearchReset:function(elm,sltd,me,Obj,p){
           	  if(this.query.hasOwnProperty('filter')){
                 delete this.query.filter;
	               this.renderLogs(elm,p);
           	  }
           },
           srchQueryByDesc:function(elm,cls,me,Obj,p){
              var val = elm.find('#srchQueryByDesc').val();
              controller.querybuilder.listRender(elm,p.p2,val);
           }
		},
		alarms:{
       size:10,
       query:{
        "from": 0,
        "size": 10
       },
		   init:function(elm){
	        var self = this;
          self.query.size = self.size;
          self.renderAlarms(elm);
       },
       renderAlarms:function(elm){
        var arr = resource.logsFields.apache,
            bdy = $(elm).find('#alarmsB'),self = this;
          $(bdy).empty();
         
          controller.production.service('.watches',self.query,function(r){
              var d = r.hits.hits;
              for(var i = 0; i < d.length; i++) {
                  var almStatus = d[i]._source._status.state.active?{cls:'label-primary',text:'Active'}:{cls:'label-default',text:'UnActive'};
                  var alarm = '<tr id="'+d[i]._id+'"><td class="project-status"><span class="label '+almStatus.cls+'">'+almStatus.text+'</span></td>'   
                  alarm = alarm + '<td class="project-title"><a>'+d[i]._id+'</a><br/><small>CreatedAt  '+d[i]._source._status.state.timestamp +'</small></td>';
                  
                  var comn ='class="btn-primary btn btn-xs" data-toggle="tooltip" data-placement="top"',
                   del = '<button '+comn+' title="Delete" log-action="deleteAlarm"><i class="fa fa-trash"></i></button>',
                   view = '<button '+comn+'title="View Detail" log-action="viewAlarm"><i class="fa fa-eye"></i></button>',
                   edit = '<button '+comn+'title="Edit Detail" onclick="load.changePage(\'p1=watcher&p2=edit\')"><i class="fa fa-pencil"></i></button>';
                  
                  alarm = alarm +'<td>'+del+view+edit+'</td></tr>';
                  $(bdy).append(alarm);
              }
              var cal='', tl = self.query.size;
              $(elm).find('[log-action="loadMore"]').removeClass('disabled');
              if(self.query.size > r.hits.total){
                tl = r.hits.total;
                $(elm).find('[log-action="loadMore"]').addClass('disabled');
              }
              cal = 'Showing 1 to '+tl+' of '+r.hits.total+' logs';
              $(elm).find('#alarmsCountingStatus').text(cal);
              self.bindEvents(elm,self);
          },'bodySearch');
       },
       bindEvents:function(elm,self){
         $(elm).find('[log-action]').on('click',function(){
            var fun = $(this).attr('log-action'),id=null;
            if(self.hasOwnProperty(fun)){
              id = $(this).closest('tr').attr('id');
            }
            self[fun](self,elm,this,id);
         });
       },
       deleteAlarm:function(self,elm,me,id){
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Alarm!",
                showCancelButton: true,
                confirmButtonColor: "#1ab394",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
              service.watch.delete(id,function(){
                swal({
                      title: "Deleted!",
                      confirmButtonColor: "#1ab394",
                      text: "Alarm has been deleted."
                    },function(){
                      self.renderAlarms(elm);
                    });
              });
            });
       }
		},
		service:function(u,q,c,t){
			service[t](u,q,function(r){ c(r);},function(r){
          console.log(r);
			});
		}
	},
  watcher:{
    req:{
      trigger : {schedule : {}},
      condition : {
        compare: {
                  "ctx.payload.hits.total" : {  }
            }
          }
    },
    init:function(elm){
      var self = this;
      $(elm).find('.clockpicker').clockpicker();
      $(elm).find('div[type]').addClass('hidden-elm');
      $(elm).find('div[type="hourly"]').removeClass('hidden-elm');
      
      $(elm).find('select[triggerTypes]').on('change',function(){
          $(elm).find('div[type]').addClass('hidden-elm');
          $(elm).find('div[type="'+$(this).val()+'"]').removeClass('hidden-elm');
          $(elm).find('div[triggerEventsList]>ul').empty();
          $(elm).find('[query="trigger"]').empty();
      })
      var datepicker =$(elm).find('.input-group.date');
      datepicker.datepicker("setDate",new Date());   
      $(elm).find('[log-action]').off('click').on('click',function(){
        var fun = $(this).attr('log-action');
        if(fun){
          self[fun](elm);
        }
      });
    },
    triggerQry:function(elm){
       function getVal(j,k,w){
           var i= $(elm).find('div[type="'+j+'"] [name="'+k+'"]').val();
           if(w != 'string'){
              i=i.split(',').map(function(item) {
                return parseInt(item, 10);
              });
              i = i.clean();
           }
         return i;
       }
       var t,s = $(elm).find('select[triggerTypes]'),qryView = $(elm).find('[query="trigger"]');
       t=s.val(),msg='';
      switch(t){
        case 'hourly':
           this.req.trigger.schedule={};
           var minute = getVal(t,'minute');
            if(minute.length > 0){
            msg = this.req.trigger.schedule[t] = {'minute':minute};
             qryView.removeClass('error');
            }else{
              msg = "error enter correct value";
              qryView.addClass('error');
            }
        break;

        case 'daily':
            this.req.trigger.schedule={};
            var hour = getVal(t,'hour'),minute = getVal(t,'minute');
            if(hour.length > 0 && minute.length > 0){
            msg = this.req.trigger.schedule[t] = {"at":{'hour':hour,'minute':minute}};
             qryView.removeClass('error');
            }else{
              msg = "error enter correct value";
              qryView.addClass('error');
            }
        break;

        case 'weekly':
        case 'monthly':
        case 'yearly':
            var oldObj=[],ul = $(elm).find('div[triggerEventsList]>ul');
            ul.empty();
            if(this.req.trigger.schedule.hasOwnProperty(t)){
                oldObj = this.req.trigger.schedule[t];
            }
            this.req.trigger.schedule={};
            var on,at = getVal(t,'at','string'),condition,newObj;
            if(t == 'monthly'){
              on = Number(getVal(t,'on','string'));
              condition =on > 0 && on < 31 && at.length > 0;
              newObj = {"on":on,'at':at};
            }else if(t == 'yearly'){
              var datepicker = $(elm).find('div[type="'+t+'"] [name="date"]').datepicker('getDate'),
              iN = new Date(datepicker).getMonth();
              on = new Date(datepicker).getDate();
              at = getVal(t,'at','string');
              condition = at.length > 0;
              newObj = {"in":iN,"on":on,'at':at};
            }else{
              on = getVal(t,'on','string');
              condition = on.length > 0 && at.length > 0;
              newObj = {"on":on,'at':at};
            }
            if(condition){
             oldObj.push(newObj);
             qryView.removeClass('error');
             msg = this.req.trigger.schedule[t] = oldObj;
              for(var p=0;p<oldObj.length;p++){
                var li = '<li index="'+p+'" class="list-group-item"><span >'+oldObj[p].on+'</span></span>&nbsp;&nbsp;, '+oldObj[p].at+'<span class="pull-right label label-success delete"><i class="fa fa-trash"></i></span></li>';
                ul.append(li);
              }
              ul.find('li span.delete').off('click').on('click',function(){
                  var indx = $(this).parent().attr('index');
                  oldObj.splice(indx,1);
                  $(this).parent().remove();
                  qryView.text(JSON.stringify(oldObj, null, 2));
              });
            }else{
              msg = "error enter correct value";
              qryView.addClass('error');
            }
        break;
      }  

      if(typeof(msg) == 'object'){
        var g={};
        g[t] =msg;
        msg = JSON.stringify(g, null, 2);
      }
      qryView.text(msg);    
    }
  },
}