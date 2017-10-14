import { Algorithms } from '/imports/api/algorithms/algorithms.js';
import { AlgorithmSettings } from '/imports/api/algorithm-settings/algorithm-settings.js';

var AlgorithmsStartupData = [
    {
        type: "BLSH",
        name: "martingale"
    },
    {
        type: "SHBL",
        name: "martingale"
    }
]

var AlgorithmSettingsStartupData = [
    {
        name: "martingale",
        type: "SHBL",
        exchange: "bitfinex",
        symbol: "ethusd",
        is_active: false,
        step_size: 0.02,
        buy_back: .99,
        start_amount: 0.1,
        max_margin_amount: 660
    },
    {
        name: "martingale",
        type: "SHBL",
        exchange: "bitfinex",
        symbol: "omgusd",
        is_active: false,
        step_size: 0.015,
        buy_back: .99,
        start_amount: 16.5,
        max_margin_amount: 12500
    },
    {
        name: "martingale",
        type: "SHBL",
        exchange: "bitfinex",
        symbol: "omgbtc",
        is_active: false,
        step_size: 0.02,
        buy_back: .99,
        start_amount: 16.5,
        max_margin_amount: 12500
    },
    {
        name: "martingale",
        type: "SHBL",
        exchange: "bitfinex",
        symbol: "neobtc",
        is_active: false,
        step_size: 0.02,
        buy_back: .99,
        start_amount: 0.1,
        max_margin_amount: 3000
    },
    {
        name: "martingale",
        type: "SHBL",
        exchange: "bitfinex",
        symbol: "neousd",
        is_active: false,
        step_size: 0.02,
        buy_back: .99,
        start_amount: 0.1,
        max_margin_amount: 3000
    }
]

AlgorithmsStartupData.forEach(( data ) => {
    var dataExist = Algorithms.findOne(data);
    // console.log("startup algorithm data", data);
    // console.log("algorithm data exist", dataExist);
    if(!dataExist){
        var result = Algorithms.insert(data);
        // console.log("adding algorithm result", result);
    }
})

AlgorithmSettingsStartupData.forEach( (data) => {
    var algorithmInsertData = {
        type: data.type,
        name: data.name
    }

    var algorithmData = Algorithms.findOne(algorithmInsertData);
    if(!algorithmData){
        console.log("algorithm data does not exist yet, insert data", algorithmData);
        Algorithms.insert(algorithmData);
        algorithmData = Algorithms.findOne(algorithmInsertData);
    }

    // console.log("algorithmData", algorithmData)

    var algorithmSettingFindCriteria = {
        algorithm_id: algorithmData._id,
        exchange: data.exchange,
        symbol: data.symbol
    }

    var algorithmSettingInsertData = {
        algorithm_id: algorithmData._id,
        exchange: data.exchange,
        symbol: data.symbol,
        is_active: data.is_active,
        step_size: data.step_size ? data.step_size : null,
        buy_back: data.buy_back ? data.buy_back : null,
        start_amount: data.start_amount ? data.start_amount : null,
        max_margin_amount: data.max_margin_amount ? data.max_margin_amount : null
    }

    var algorithmSettingData = AlgorithmSettings.findOne(algorithmSettingFindCriteria)
    if(!algorithmSettingData){
        console.log("algorithm setting data does not exist, insert setting data", algorithmSettingInsertData);
        AlgorithmSettings.insert(algorithmSettingInsertData);
        algorithmSettingData = AlgorithmSettings.findOne(algorithmSettingFindCriteria)
    }


    // console.log("algorithmSettingData", algorithmSettingData);

})

