Array.prototype.clean = function() {
  for (var i = 0; i < this.length; i++) {
    if (!this[i]) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};


var load={
	ts:function ts(e,f,c){$(e).load(f,function(a){$(e).empty();$(e).append(a);if(c){c()}});},
	js:function(p,c){
     var s = document.createElement("script")
         s.type = "text/javascript";
          if (s.readyState){  //IE
              s.onreadystatechange = function(){
                  if (s.readyState == "loaded" || s.readyState == "complete"){
                      s.onreadystatechange = null;
                      if(c)
                        c();
                  }
              };
          } else { s.onload = function(){
            if(c)
              c(); 
          };}
          s.src = p;
      document.getElementsByTagName("head")[0].appendChild(s);
  },
  sidebar:function(e,d1){
    function ss(d){
      for(var i=0;i < d.length; i++) {
          var item = d[i];
          if(!item.hasOwnProperty('subItems')){
              var li ='<li id="'+item.id+'"><a class="mainmanuItem" redirect="'+item.redirectTo+'"><i class="fa '+item.icon+'"></i> <span class="nav-label">'+item.title+'</span></a></li>';
              $(e).append(li);
          }else{
              var li ='<li id="'+item.id+'" class="hasSubItems"><a class="mainmanuItem" redirect="'+item.redirectTo+'"><i class="fa '+item.icon+'"></i> <span class="nav-label">'+item.title+'</span><span class="fa arrow"></a><ul class="nav nav-second-level collapse"></ul></li>';
              $(e).append(li);
              for(var j=0;j < item.subItems.length;j++){
                var subItem = item.subItems[j];
                var subli ='<li id="'+subItem.id+'"><a class="mainmanuItem" redirect="'+subItem.redirectTo+'">'+subItem.title+'</a></li>';
                $(e).find('li#'+item.id +' > ul').append(subli);
              }
          }
        }

        $(e).find('.mainmanuItem').off('click').on('click',function(){
            load.changePage($(this).attr('redirect'));
        });
    }

    if(localStorage.getItem('lognomy')){
        service.setHeader(localStorage.getItem('lognomy'));
        service.shield.get('authenticate',function(r){
           service.tempInfo = r;
           if(r.hasOwnProperty('full_name')){
             var roles = r.roles.toString();
             $(e).find('.lognomyUsername').text(r.full_name);
             $(e).find('.lognomyUserRole').text(roles);
             if(roles.search('superuser') >= 0){
               var admin = resource.adminOption;
               d1.push(admin);
               ss(d1);
             }else{
                ss(d1);
             }
           }
        });
    }
    //this.watcher.start();
	},
  sidebarItemSelection:function(p){
       var page = 'dashboard';
       if(p.p1){page = p.p1;}
       var e = '#sidebar-box ul#side-menu';
       $(e).find('li').removeClass('active');
       $(e).find('ul').removeClass('in active');
       var activePage = $(e).find('#'+page);
       $(activePage).addClass('active');
       if($(activePage).hasClass('hasSubItems')){
          $(activePage).find('ul').addClass('in active');
          var gg ='#'+page+'_'+p.p2;
          $(gg).addClass('active');
       }
  },
  changed:function(){
      var self=this,params = self.getUrlQuery(),bodyContent = $('#bodyContent');
      bodyContent.removeClass('fadeInLeft hidden-elm');
      bodyContent.empty();
      $('#bodyContentQueyBuilder').addClass('hidden-elm').removeClass('fadeInLeft');
      if(params.hasOwnProperty('p1') && params.p1 != 'querybuilder'){
        var dd = params.p2 && params.p2 != ''?params.p1+"/"+params.p2:params.p1;
        load.ts('#bodyContent','view/'+dd+'.html',function(){
            bodyContent.addClass('fadeInLeft');
            if(controller.hasOwnProperty(params.p1)){
                self.currentPthDisplay(params);
                controller[params.p1].init(bodyContent,params);
                load.sidebarItemSelection(params);
            }
        });
      }else if(params.hasOwnProperty('p1') && params.p1 == 'querybuilder'){
         bodyContent.addClass('hidden-elm');
        $('#bodyContentQueyBuilder').removeClass('hidden-elm').addClass('fadeInLeft');
        if(controller.hasOwnProperty(params.p1)){
            self.currentPthDisplay(params);
            controller[params.p1].init($('#bodyContentQueyBuilder'),params);
            load.sidebarItemSelection(params);
        }
      }

  },
  getUrlQuery(){
      var queries = {};
      $.each(document.location.search.substr(1).split('&'),function(c,q){
        var i = q.split('=');
        if(i.length > 1){queries[i[0].toString()] = i[1].toString();}else{
            queries['p1'] = 'dashboard';
        }
      });
      return queries;
  },
  changePage:function(q){
       window.history.pushState('newQry','newQry','?'+q);
       load.changed();
  },
  replacePage:function(e,q){
      event.stopPropagation();
      event.preventDefault();
      var p = this.getUrlQuery();
      if(!p.hasOwnProperty('p2')){ p['p2']='apache'; }
       window.history.replaceState('newQry','newQry','?p1=production&p2='+p.p2+'&p3='+q);
       load.changed();
  },
  currentPthDisplay:function(p){
      $('#currentpathDisplay').empty();
      for(var i in p) {
        $('#currentpathDisplay').append('<li>'+p[i]+'</li>');
      }
  },
  alert:{
    open:function(e,m,t){
      this.close(e);
      var alert = '<div class="alert '+t+'" alert-dismissable"><button aria-hidden="true" data-dismiss="alert" class="close" type="button">×</button>'+m+'<a class="alert-link" href="#"></a></div>';
      $(e).append(alert);
    },
    close:function(e){
      $(e).find('.alert').remove();
    }
  },
  watcher:{
    interval:null,
    start:function(){
      var self = this;
      self.stop();
      self.getNotification();
      self.interval = setInterval(function(){
         self.getNotification();
      },1000*60*1);
    },
    stop:function(){
      if(this.interval){
         clearInterval(this.interval);
      }
    },
    getNotification(){
      var to = new Date().getTime(),results=5,i = new Date(),
      //from = i.setMinutes(i.getMinutes() - 5);
      from = i.setHours(i.getHours() - 2);
      //from = i.setDate(i.getDate() - 1);
      service.watch.history.getByTimeRange(from,to,function(r){
          if(r.hasOwnProperty('hits')){
            var notification = $('lognomyHeader [lognomy-notification]'),list = notification.find('.notificationList');
            if(r.hits.total < 1){return '';}
            notification.find('.notificationCounter').addClass('noti-info').text(r.hits.total);
            list.empty();
            results = r.hits.total < results?r.hits.total:results;
            for (var i = 0; i < results; i++) {
              var d=r.hits.hits[i]._source,
               date = new Date(d.trigger_event.triggered_time),
               li = '<li onclick="load.changePage(\'p1=notifications\')"><div class="dropdown-messages-box"><div class="media-body"><small class="pull-right">'+date.getHours()+':'+date.getMinutes()+'</small><strong>'+d.watch_id+'</strong> </div></div></li><li class="divider"></li>';
              list.append(li);
            }
            var all = '<li><div class="text-center link-block"><a href="mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong> </a></div></li>';
            list.append(all);
          }
      },results);
    }
  }
}

