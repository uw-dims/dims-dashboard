'use strict'
// testing order of execution
// console.log("0");
describe('Mocha order of execution test: level A', function () {
    // console.log("1");
    beforeEach(function () {
        // console.log("5");
    });

    describe('level B', function(){
        // console.log("2");

        describe('level C', function(){
        // console.log("3");

            beforeEach(function () {
                // console.log("6");
            });

            it('foo', function () {
                // console.log("7");
            });
        });
    });
});
// console.log("4");