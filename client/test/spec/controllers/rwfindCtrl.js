'use strict';

//Jasmine Suite
describe('Suite testing Controller: RwfindCtrl', function () {

  // load the controller's module
  beforeEach(module('dimsDashboard'));

  var RwfindCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RwfindCtrl = $controller('RwfindCtrl', {
      $scope: scope
    });
  }));

  //Jasmine spec
  it('should initialize scope properties', function () {
    expect(scope.showResults).toBe(false);
    expect(scope.showJsonResults).toBe(false);
    expect(scope.resultsMsg).toBe('Results');
    expect(scope.result).toBeNull();
    expect(scope.rawData).toBe('');
    expect(scope.dataSize).toBe(100);
    expect(scope.totalDataSize).toBe(0);
    expect(scope.query).toBe('');
    expect(scope.flows.length).toBe(0);
    expect(scope.flowStats.length).toBe(0);
  });
});
