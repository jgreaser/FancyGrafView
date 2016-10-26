angular
    .module('app')
    .controller('graphController', graphController);

graphController.$inject = ['$rootScope', '$window', '$scope', '$element', '$compile', 'graphService', 'mailService'];

function graphController($rootscope, $window, $scope, $element, $compile, graphService, mailService) {


    var vm = this;
    
    vm.cb = cb;

    //initial board layout
   $window.onload = function() {
     updateBoardAttributes('default');
    };



    vm.graphObject = graphService.getGraphObject();



     //JXG.JSXGraph.initBoard('jxgbox', {boundingbox: [-5, 2, 5, -2]});
     var board = JXG.JSXGraph.initBoard('jxgbox', vm.graphObject.board);

     var currentGraphObject = 0;
     angular.forEach(vm.graphObject.content, function(value, key) {
          console.log(key + ': ' + value.type);
          currentGraphObject = key;
          cb(board, value.type);
        });

//    initializeBoard(vm.board, vm.graphObject.content[0].type);


    function initializeBoard(typeOfGraphObject) {
        cb(vm.board, typeOfGraphObject);
    }

    

    function cb(board, typeOfGraphObject) {

        //eval is used to get strings out of forms and convert to usable variable data
        //function fn is the function that graphs a line based on a mathmatical function (lines that pass the vertical line test)
       // eval("var fn = function(x){ return " + vm.functionForGraph + ";}");
       
       

        //rest alt/data 
        vm.altAttr = 'unavailable for this chart type';
        vm.dataSet = 'unavailable for this chart type';
        



        if (typeOfGraphObject == "label"){
            console.log("label");
            console.log(vm.graphObject.content[currentGraphObject]);
            board.create("text",[vm.graphObject.content[currentGraphObject].data.x,vm.graphObject.content[currentGraphObject].data.y,vm.graphObject.content[currentGraphObject].data.text], {cssClass:'mytext', size: 20});
        }



        //If a graph object is a certain type, do that thing
        if (typeOfGraphObject == "function") {
         //   console.log("build function");

         var fn = board.jc.snippet(vm.graphObject.content[currentGraphObject].data.function, true, 'x', true);

            graphService.buildFunction(board, fn, vm.graphObject.content[currentGraphObject].data.lineAttributes);
        }

        if (typeOfGraphObject == "line") {
            //board.create('line', points, lineAttr);
            var pointsAttr = {};
             vm.objectList.push(graphService.buildLine(board, points, pointsAttr, lineAttr));
        }

        if (typeOfGraphObject == "verticalLineTest") {
            vm.graphObject.content.push({type: "verticalLineTest"});
            verticalLineTest(true);
        }

        if (typeOfGraphObject == "point") {
           vm.graphObject.content.push({type: "point", data: {newPoint: newPoint, newPointX: vm.newPointX, newPointY: vm.newPointY}});

           vm.objectList.push(graphService.buildPoint(board, newPoint, vm.newPointX, vm.newPointY)) ;
        }

        // dotPlotData = [[1,2],[3,4]];
        if (typeOfGraphObject == "dotPlot") {
            vm.objectList.push(null);


            eval("var data = [" + vm.dotPlotData + "]");

            vm.graphObject.content.push({type: "dotPlot", data: data[0]});


            vm.dataSet = '';

            buildAlt(typeOfGraphObject, data[0]); //pass in the dotplot data from the eval statement
            buildDataSet(typeOfGraphObject,data[0]);

            var maxNum = 0;
            var maxXVal = 0;

            maxXVal = getMaxKeyVal(data[0]);

            var dotPlotAxis = board.create('axis', [
                [vm.dotPlotMin, 0],
                [maxXVal, 0]
            ]);

            board.create('ticks', [dotPlotAxis], {
                insertTicks: false,
                strokeColor: '#333333',
                majorHeight: 15,
                drawLabels: true
            });

            angular.forEach(data[0], function(value) {
                for (i = 0; i < value[1]; i++) {
                    board.create('point', [value[0], i+1], {
                        fillColor: '#ec7a00',
                        strokeColor: '#ec7a00'
                    });
                }
            });
        }

        if (typeOfGraphObject == "inequality") {
           vm.graphObject.content.push({type: "point", data: points});

            var inequalityLine = board.create('line', points, {
                visible: false
            });
            vm.objectList.push(board.create('inequality', [inequalityLine], {
                inverse: val,
                strokeColor: '#788e52',
                highlightStrokeColor: '#111111',
                strokeColorOpacity: 1,
                dash: 4,
                strokeWidth: 2,
                straightFirst: true,
                straightLast: true,
                firstArrow: false,
                lastArrow: false,
                trace: false,
                shadow: false,
                visible: true,
                margin: -15
            }));
        }

        if (typeOfGraphObject == "boxPlot") {

            eval("var minOutliers = [" + vm.boxPlotMinOutliers + "]");
            eval("var maxOutliers = [" + vm.boxPlotMaxOutliers + "]");
           // console.log("minOutliers " + minOutliers);


            //determine if lines should continue past points
            lineAttr.straightFirst = false;
            lineAttr.straightLast = false;

            buildAlt(typeOfGraphObject, null); //pass in the dotplot data from the eval statement
            buildDataSet(typeOfGraphObject, null);

           // console.log("vm.showBoxPlotOutliers is " + vm.showBoxPlotOutliers);
            if (vm.showBoxPlotOutliers == true){
             //   console.log("its true!");

                minValue = getSmallestNumber(vm.boxPlotMin, minOutliers);
                maxValue = getBiggestNumber(vm.boxPlotMax, maxOutliers);

                //console.log(minValue);
               // console.log(maxValue);

                angular.forEach(minOutliers, function(value) {
                
                        board.create('point', [value, vm.boxPlotOffset], {
                            face:'o',
                            fillColor: '#ec7a00',
                            strokeColor: '#ec7a00'
                        });
            
                 });

                angular.forEach(maxOutliers, function(value) {
               
                         board.create('point', [value, vm.boxPlotOffset], {
                            face:'o',
                            fillColor: '#ec7a00',
                            strokeColor: '#ec7a00'
                        });
                     
                 });



           }
             


            var boxPlotAxis = board.create('axis', [
                [vm.boxPlotMin, 0],
                [vm.boxPlotQ1, 0]
            ]);

            board.create('ticks', [boxPlotAxis, [vm.boxPlotMin, vm.boxPlotQ1, vm.boxPlotMed, vm.boxPlotQ3, vm.boxPlotMax]], 
            //tick attributes
            {
                strokeColor: '#00ff00',
                majorHeight: 15,
                drawLabels: true
            });
            var dataObject = {
                boxPlotMin: vm.boxPlotMin,
                boxPlotQ1: vm.boxPlotQ1,
                boxPlotMed: vm.boxPlotMed,
                boxPlotQ3: vm.boxPlotQ3, 
                boxPlotMax: vm.boxPlotMax,
                boxPlotOffset: vm.boxPlotOffset};
           // console.log("dataobject is");
           // console.log(dataObject);
            graphService.buildBoxPlotBoxes(board, lineAttr, dataObject);

            vm.graphObject.content.push({type: "boxPlot", data: dataObject});

        }

        if (typeOfGraphObject == 'barChart') {
            vm.graphObject.content.push({type: "barChart", data: vm.barChartData});

            var barChartXAxis = board.create('axis', [
                [0, 0],
                [0, 10000]
            ]);
            var barChartYAxis = board.create('axis', [
                [0, 0],
                [10000, 0]
            ]);

            eval("var data = [" + vm.barChartData + "]");
            colors = ['#788e52', '#8d37c4', '#4e767a'];

            board.create('chart', data, {
                chartStyle: 'bar',
                width: -1,
                colors: colors,
                labels: data            });


        }

      

    }

    function buildAlt(graphType, data){
        vm.altAttr = '';

        if(graphType == 'dotPlot'){
            angular.forEach(data, function(value) {
                vm.altAttr += "There are " + value[1] + " points above " + value[0] + ". ";
            });
            
            }
        if(graphType == 'boxPlot'){
            vm.altAttr += "There is a line from " + vm.boxPlotMin + " to " + vm.boxPlotQ1 + ", then a box from " + vm.boxPlotQ1 + " to " + vm.boxPlotMed + ", another box from " + vm.boxPlotMed + " to " + vm.boxPlotQ3 + ", and a line from " + vm.boxPlotQ3 + " to " + vm.boxPlotMax + ".";
        }
    }

    function buildDataSet(graphType, data){
        
        if  (graphType == 'dotPlot'){
        angular.forEach(data, function(value) {
                for (i = 0; i < value[1]; i++) {
                    vm.dataSet += value[0] + ", ";
                }

            });
        vm.dataSet = vm.dataSet.slice(0, vm.dataSet.length - 2);
        }
        if  (graphType == 'boxPlot'){
            vm.dataSet = "Minimum value is " + vm.boxPlotMin + ",  Q1 is " + vm.boxPlotQ1 + ", Median is " + vm.boxPlotMed + ", Q3 is " + vm.boxPlotQ3 + ", and maximum value is " + vm.boxPlotMax + ".";
        }

    }

     

 


    function updateBoardAttributes(typeOfGraph) {


        if (typeOfGraph == 'default') {
            var boardAttr = vm.graphObject.board;
        } else if (typeOfGraph == 'boxPlot') {

            eval("var minOutliers = [" + vm.boxPlotMinOutliers + "]");
            eval("var maxOutliers = [" + vm.boxPlotMaxOutliers + "]");

            var minValue;
            var maxValue;

            if (vm.showBoxPlotOutliers == true){

                minValue = getSmallestNumber(vm.boxPlotMin, minOutliers);
                maxValue = getBiggestNumber(vm.boxPlotMax, maxOutliers);
            }
            else {
                minValue = vm.boxPlotMin;
                maxValue = vm.boxPlotMax;
                }


            eval("var boardAttr = {boundingbox: [" + (minValue - (maxValue* 0.2)) + ", 10, " + getGridMax(parseInt(maxValue)) + ", -3], axis: false, grid: false, showcopyright: false, shownavigation: false, registerEvents: true, snapToGrid: true, snapSizeX: 1, snapSizeY: 1 };");
        } else if (typeOfGraph == 'dotPlot') {
            eval("var data = [" + vm.dotPlotData + "]");
            var maxNum = 0;
            var maxXVal = 0;
            angular.forEach(data[0], function(value) {

                if (value[0] > maxXVal) {
                    maxXVal = value[0]
                }

                for (i = 0; i < value[1]; i++) {
                    if (i > maxNum) {
                        maxNum = i;
                    }
                }
            });

            eval("var boardAttr = {boundingbox: [" + (vm.dotPlotMin - (maxNum * 0.2)) + ", " + (getGridMax(parseInt(maxNum))+1) + ", " + getGridMax(parseInt(maxXVal)) + ", -3], axis: false, grid: false, showcopyright: false, shownavigation: false, registerEvents: true, snapToGrid: true, snapSizeX: 1, snapSizeY: 1 };");
        } else if (typeOfGraph == 'barChart') {
            eval("var data = [" + vm.barChartData + "]");
            var maxX = getMaxData(data);

            eval("var boardAttr = {boundingbox: [" + (0 - 1) + ", " + (maxX + (maxX * 0.2)) + ", " + (data.length + data.length * 0.2) + ", " + (0 - (maxX * 0.2)) + "], axis: false, grid: false, showcopyright: false, shownavigation: false, registerEvents: true, snapToGrid: true, snapSizeX: 1, snapSizeY: 1 };");
        }

        JXG.JSXGraph.freeBoard(vm.board);

        console.log("vm.graphObject.board is ");
        console.log(vm.graphObject.board);

        vm.board = JXG.JSXGraph.initBoard('box', boardAttr);

        if (typeOfGraph == 'boxPlot') {
            cb(vm.board, 'boxPlot');
        } else if (typeOfGraph == 'barChart') {
            cb(vm.board, 'barChart');
        } else if (typeOfGraph == 'dotPlot') {
            cb(vm.board, 'dotPlot');
        }
    }

    function getMaxData(data) {
        var maxData = 0;
        angular.forEach(data, function(value) {
            if (value > maxData) {
                maxData = value;
            }
        });
        return maxData;
    }

    function getMaxKeyVal(data){
        var maxXVal = 0;
        angular.forEach(data, function(value) {
                if (value[0] > maxXVal) {
                    maxXVal = value[0]
                }
            });
        return maxXVal;
    }

    function getPointsArray() {
        return graphService.getPointsArray();
    }

    

    function getDisplayName(graphObject){
       // console.log("graphObject is ");
       // console.log(graphObject);

        var displayName = '';
        if (graphObject.htmlStr != null){
            displayName = graphObject.htmlStr;
        }
       if (graphObject.elType == "curve"){
            displayName = "curve";
        }
        if (graphObject.elType == "line"){
            displayName = "line " + graphObject.name;
        }
        //console.log("getDisplayName is " + displayName);
    
        return displayName;

    }

  



   

    function verticalLineTest(val) {
        if (val == true) {
            vm.board.create('line', [
                [-4, 0],
                [-4, 1]
            ], {
                strokeColor: '#999999',
                dash: 2
            });
            vm.board.create('line', [
                [-2, 0],
                [-2, 1]
            ], {
                strokeColor: '#999999',
                dash: 2
            });
            vm.board.create('line', [
                [2, 0],
                [2, 1]
            ], {
                strokeColor: '#999999',
                dash: 2
            });
            vm.board.create('line', [
                [4, 0],
                [4, 1]
            ], {
                strokeColor: '#999999',
                dash: 2
            });
        } else {
            console.log("no vertical line test");
        }
    }



    //utilities
   function getSmallestNumber(value, arrayOfValues){
       
             angular.forEach(arrayOfValues, function(arrayValue) {
                if (value > arrayValue){value = arrayValue;}

            });
             return value;

    }


    function getBiggestNumber(value, arrayOfValues){
        angular.forEach(arrayOfValues, function(arrayValue) {

            if (value < arrayValue){
                value = arrayValue;
            }

            });
        return value;

    }
       function getGridMax(val) {

        return (val + (val * 0.2));
    }

}