import { AlgorithmRuns } from '/imports/api/algorithm-runs/algorithm-runs.js';

Meteor.methods({
    "allAlgorithmRuns": function(){
        var allAlgoRuns = AlgorithmRuns.find().fetch();
        console.log("all algorithm runs", allAlgoRuns);
    },
    "removeAlgorithmRuns": function(exchange, symbol){
        AlgorithmRuns.remove({exchange: exchange, symbol: symbol})
    },
    "resetAlgorithmRuns": function(){
        AlgorithmRuns.remove({})
    }
})