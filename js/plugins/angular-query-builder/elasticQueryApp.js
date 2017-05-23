
  var queryBuilder = window.angular.module('elasticQueryApp', [
    'angular-elastic-builder',
  ]);

  queryBuilder.controller('BasicController', ['$scope', function ($scope) {

    var data = this.data = {};
    $scope.setFieldsStatus =false;
    queryBuilder.currentQuery ={filter:{}};
    data.query = [];
 
    data.fields = {};

    data.needsUpdate = true;

    this.showQuery = function() {
      queryBuilder.currentQuery.filter['and'] = data.query;
      return JSON.stringify($scope.queryToShow, null, 2);
    };

    $scope.setFields = function(){
        data.fields = queryBuilder.fields;
        if(Object.keys(queryBuilder.fields).length > 0){
          $scope.setFieldsStatus=true;
        }else{
          $scope.setFieldsStatus =false;
        }
    }

  }]);

/*{
  '@timestamp': { type: 'date' },
  'host': { type: 'term' },
  'clientip': { type: 'term'},
  'date': { type: 'term' },
  'action': { type: 'term' },
  'host': { type: 'term' },
  'protocol': { type: 'term' },
  'responce': { type: 'number'},
  'status': { type: 'number' },
  'country_name': { type: 'term' }
}*/