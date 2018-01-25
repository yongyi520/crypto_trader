import React, { Component } from 'react';

import classNames from 'classnames'

import { AlgorithmSettings } from '/imports/ui/components/algorithm-settings/AlgorithmSettings.jsx';
import { AlgorithmRuns } from '/imports/ui/components/algorithm-runs/AlgorithmRuns.jsx';
import { AlgorithmRunOrders } from '/imports/ui/components/algorithm-run-orders/AlgorithmRunOrders.jsx';

import { NewSetOrders } from '/imports/ui/components/forms/set-orders/new/NewSetOrders.jsx';
import { EditSetOrders } from '/imports/ui/components/forms/set-orders/edit/EditSetOrders.jsx';

require('/imports/ui/components/exchange/binance/Binance.sass')

export class Binance extends Component {
    constructor(props){
        super(props);
        this.state = {
            algorithmSelect: null,
            algorithmOptions: null,
            typeSelect: null,
            typeOptions: null,
            symbolSelect: null,
            symbolOptions: null,
            algorithmSettings: null,
            algorithmRunSelect: null
        }
        this.getAlgorithmSettings.bind(this)
    }

    componentDidMount(){
        var algorithmOptions = [];
        var typeOptions = [];
        var symbolOptions = [];
        var algorithmDatabase = this.props.algorithms.find().fetch();
        var algorithmSettings = this.props.algorithmSettings.find({exchange: 'binance'}).fetch();
        algorithmDatabase.map( (algo) => {
            if(_.contains(algorithmOptions, algo.name) == false){
                algorithmOptions.push(algo.name)
            }
            if(_.contains(typeOptions, algo.type) == false){
                typeOptions.push(algo.type)
            }
        })

        // algorithmSettings.map(setting => {
        //     if(_.contains(symbolOptions, setting.symbol) == false){
        //         symbolOptions.push(setting.symbol);
        //     }
        // })
        symbolOptions = ['BNBBTC']

        this.setState({
            algorithmOptions: algorithmOptions,
            typeOptions: typeOptions,
            symbolOptions: symbolOptions
        })
    }

    clearLogs(){
        Meteor.call("clearAllSystemLogs");
    }

    updateAlgorithmSelect(algorithmName){
        this.setState({ algorithmSelect: algorithmName, algorithmRunSelect: null})
    }

    updateSymbolSelect(symbolName){
        this.setState({symbolSelect: symbolName, algorithmRunSelect: null})
    }

    updateTypeSelect(typeName){
        this.setState({typeSelect: typeName, algorithmRunSelect: null})
    }

    getAlgorithmSettings(){
        if(this.state.typeSelect && this.state.algorithmSelect && this.state.symbolSelect){
            var algorithm = this.props.algorithms.findOne({name: this.state.algorithmSelect, type: this.state.typeSelect});
            var algorithmSetting = this.props.algorithmSettings.findOne({algorithm_id: algorithm._id, symbol: this.state.symbolSelect, exchange: 'binance'})
            return algorithmSetting;
        }
        return null;
    }

    getAlgorithmRuns(){
        if(this.state.typeSelect && this.state.algorithmSelect && this.state.symbolSelect){
            var algorithm = this.props.algorithms.findOne({name: this.state.algorithmSelect, type: this.state.typeSelect});
            var algorithmRun = this.props.algorithmRuns.find({algorithm_id: algorithm._id, symbol: this.state.symbolSelect, exchange: 'binance',
                $or: [{status: 'ACTIVE'}, {status: 'CREATED'}]}).fetch()
            console.log("getting algorithm run", algorithmRun);
            return algorithmRun;
        }
        return null;
    }

    updateAlgorithmRunSelect( algorithmRun ){
        this.setState({algorithmRunSelect: algorithmRun})
    }

    getAlgorithmRunOrders(){
        if(this.state.typeSelect && this.state.algorithmSelect && this.state.symbolSelect){
            var algorithm = this.props.algorithms.findOne({name: this.state.algorithmSelect, type: this.state.typeSelect});
            var algorithmRun = this.props.algorithmRuns.findOne({algorithm_id: algorithm._id, symbol: this.state.symbolSelect, exchange: 'binance', status: 'ACTIVE'})
            if(algorithmRun){
                var algorithmRunOrderIds = algorithmRun.order_ids;
                var algorithmRunOrders = this.props.orders.find({order_id: {$in: algorithmRunOrderIds}}).fetch()
                return algorithmRunOrders;
            } else {
                return null;
            }

        }
        return null;
    }

    getSystemLogs(){
        if(this.state.typeSelect && this.state.algorithmSelect && this.state.symbolSelect){
            var algorithm = this.props.algorithms.findOne({name: this.state.algorithmSelect, type: this.state.typeSelect});
            console.log("algorithm", algorithm);
            var algorithmLogCriteria = {
                algorithm_id: algorithm._id,
                exchange: 'binance',
                symbol: this.state.symbolSelect
            };
            var wssLogCriteria = {
                algorithm_id: "server",
                exchange: 'binance',
                symbol: 'server'
            }
            var filteredLogs = this.props.logs.find({
                $or: [
                    algorithmLogCriteria,
                    wssLogCriteria
                ]
            }).fetch();
            return filteredLogs;
        }
        return [];
    }

    render(){
        console.log("binance props", this.props);
        console.log("binance states", this.state);
        return (
            <div id="Binance">
                <div className="title">
                    <div className="exchange-name">
                        <h1>binance</h1>
                    </div>

                    <div className="server-status">
                        <img src={"/images/connected.png"}/>
                    </div>
                </div>
                <div className="content">
                    <div className="left-menu">
                        <div className="left-menu-column algorithm">
                            <div className="title">
                                Algorithm
                            </div>
                            <div className="selection">
                                { this.state.algorithmOptions ?
                                    this.state.algorithmOptions.map( algorithmName => {
                                        return <span key={algorithmName}
                                                     onClick={() => this.updateAlgorithmSelect(algorithmName)}
                                                     className={classNames({selected: this.state.algorithmSelect == algorithmName})}
                                        >
                                        {algorithmName}
                                        </span>
                                    })
                                    :
                                    null
                                }

                            </div>

                        </div>
                        <div className="left-menu-column type">
                            <div className="title">
                                Type
                            </div>
                            <div className="selection">
                                { this.state.typeOptions ?
                                    this.state.typeOptions.map( typeName => {
                                        return <span key={typeName}
                                                     onClick={() => this.updateTypeSelect(typeName)}
                                                     className={classNames({selected: this.state.typeSelect == typeName})}
                                        >
                                            {typeName}
                                            </span>
                                    })
                                    :
                                    null
                                }

                            </div>
                        </div>
                        <div className="left-menu-column symbol">
                            <div className="title">
                                Symbol
                            </div>
                            <div className="selection">
                                { this.state.symbolOptions ?
                                    this.state.symbolOptions.map( symbolName => {
                                        return <span key={symbolName}
                                                     onClick={() => this.updateSymbolSelect(symbolName)}
                                                     className={classNames({selected: this.state.symbolSelect == symbolName})}
                                        >
                                            {symbolName}
                                            </span>
                                    })
                                    :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                    <div className="right-content">
                        <div className="left">
                            <div className="system-logs">
                                <div className="title">
                                    System Logs
                                </div>
                                <div className="logs">
                                    { this.getSystemLogs().map( log => {
                                        return <p key={log._id}  className={classNames({
                                            'update': log.type == 'UPDATE',
                                            'error': log.type == 'ERROR'
                                        })}>{log.log}</p>
                                    })}
                                </div>
                                <div className="action-panel">
                                    <button onClick={this.clearLogs.bind(this)} >Clear</button>
                                </div>
                            </div>

                            <div className="display">
                                <div className="title">
                                    Algorithm Run
                                </div>
                                <div className="run">
                                    <AlgorithmRuns algorithmName={this.state.algorithmSelect} algorithmRuns={this.getAlgorithmRuns()} updateAlgorithmRunSelect={this.updateAlgorithmRunSelect.bind(this)}/>
                                </div>
                            </div>

                        </div>
                        <div className="right">
                            { this.state.algorithmRunSelect ?
                                <EditSetOrders symbol={this.state.symbolSelect} algorithmRun={this.state.algorithmRunSelect} updateAlgorithmRunSelect={this.updateAlgorithmRunSelect.bind(this)}/>
                                :
                                <NewSetOrders symbol={this.state.symbolSelect}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

