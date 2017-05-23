var service = {
   fixedUrl:'http://localhost:9200/',
   tempInfo:{},
   btoa:null,
   getQry:function(u,m,success, error){
      var req ={
         url : service.fixedUrl+u,
         type: m,
         headers:service.btoa,
         timeout: 20000,
         contentType: "application/json",
         success: success,
         error : error
      }
      return req;
   },
   post:function(u, data, success, error){
      var req = this.getQry(u,"POST", success, error);
      req['data']=JSON.stringify(data);
      $.ajax(req);
   },
   put:function(u, data, success, error){
      var req = this.getQry(u,"PUT",success, error);
      $.ajax(req);
   },
   get:function(u,query,success, error){
      var req = this.getQry(u,"GET",success, error);
      $.ajax(req);
   },
   delete:function(u,q,success, error) {
      var req = this.getQry(u,"DELETE",success, error);
      $.ajax(req);
   },
   setHeader:function(k){
     service.btoa= {Authorization: "Basic "+k};
   },
   getDocById : function(url, query, success, error) {
      this.get(url,query, success, error);
   },
   bodySearch : function(url, data, success, error) {
      var u=  url + '/_search';
      this.post(u, data, success, error);
   },
   partialUpdate : function(url, data, success, error) {
      data = {"doc" : data};
      var u=  url + '/_update';
      this.post(u, data, success, error);
   },
   deleteDoc : function(url,q,success, error) {
      var u= url;
      this.post(u, q, success, error);
   },
   createUser:function(data, success, error) {
      var u= '/_shield/user/'+data.username;
      this.post(u, data, success, error);
   },
   loginUser:function(success, error){
      var u = '_cluster/health';
      this.get(u,'', success, error);
   },
   saveQuery:function(data, success){
      data['createdBy']= service.tempInfo.username;
      var u = 'lognomy/query';
      service.post(u,data,success, function(t){console.log(t+' error');});
   },
   getQueries:function(data,success){
      var u = 'lognomy/_search';
      service.post(u,data,success, function(t){console.log(t+' error');});
   },
   deleteQuery:function(id,success){
      var u = 'lognomy/query/'+id;
      service.delete(u,'',success, function(t){console.log(t+' error');});
   },
   kibanaLogin:function(k,v,success, error){
     var u = 'https://localhost:5551/api/shield/v1/login',hdr = service.btoa;
     //this.post(u,{username:k,password:v}, success, error);
    // hdr['kbn-version']='5.0.0-alpha6';
     $.ajax({
            url : u,
            method: "POST",
            headers:hdr,
            timeout: 20000,
            contentType:'application/json;charset=UTF-8',
            data : JSON.stringify({username:k,password:v}),
            success: success,
            error : error
      });
   },
   watch:{
      getById:function(id,success){
        var u = '_watcher/watch/'+id;
        service.get(u,'', success, function(){});
      },
      delete:function(id,success){
        var u = '_watcher/watch/'+id;
        service.delete(u,'', success, function(){});
      },
      activate:function(id,success){
        var u = '_watcher/watch/'+id +'_activate';
        service.put(u,'', success, function(){});
      },
      deactivate:function(id,success){
        var u = '_watcher/watch/'+id +'_deactivate';
        service.put(u,'', success, function(){});
      },
      history:{
         getByTimeRange:function(from,to,success,size){
           var u = '.watch_history*/_search',
            data = {"filter":{"range":{"trigger_event.triggered_time":{"gte":from,"lte":to}}},"size":size,"sort" : [
                 {"trigger_event.triggered_time" : {"order" : "desc"}}
            ]};
            service.post(u,data,success, function(){});
         },
         getByQuery:function(){

         }
      }
   },
   shield:{
      list:function(t,success){
       var u = '_shield/'+t;
       service.get(u,'',success, function(t){console.log(t+' error');});
      },
      get:function(t,success){
       var u = '_shield/'+t;
       service.get(u,'',success, function(t){console.log(t+' error');});
      },
      save:function(t,data,success){
         var u = '_shield/'+t;
         service.post(u,data,success, function(t){console.log(t+' error');});
      }
   }
}
