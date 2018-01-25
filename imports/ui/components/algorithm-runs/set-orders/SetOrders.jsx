import React, { Component } from 'react';

require('/imports/ui/components/algorithm-runs/set-orders/SetOrders.sass')

export class SetOrders extends Component {

    updateAlgorithmRun(run){
        console.log("algorithm run update called in set order display");
    }

    render(){
        return (
            <div id="algorithm-run-panel">
                { (this.props.algorithmRuns) ?
                    <div className="set-orders">
                        { this.props.algorithmRuns.map( run => {
                            return (
                            <div key={run._id} className="run">
                                <div className="run-header row">
                                    <div className="col-sm-3">
                                        {run.symbol}
                                    </div>
                                    <div className="col-sm-5">
                                        {run.status}
                                    </div>
                                    <div className="col-sm-2">
                                        <button onClick={() => this.props.updateAlgorithmRunSelect(run)} >Edit</button>
                                    </div>
                                    <div className="col-sm-2">
                                        <button>Cancel</button>
                                    </div>
                                </div>
                                <div className="run-content">
                                    <div className="order">
                                        <div className="orders-header row">
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2"></div>
                                            <div className="col-sm-2">Status</div>
                                            <div className="col-sm-1">Side</div>
                                            <div className="col-sm-2">Limit Price</div>
                                            <div className="col-sm-2">Price</div>
                                            <div className="col-sm-2">Quantity</div>
                                        </div>
                                        <div className="orders-content row">
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">Entry</div>
                                            <div className="col-sm-2">{run.entry_order.status}</div>
                                            <div className="col-sm-1">{run.entry_order.side}</div>
                                            <div className="col-sm-2"> - </div>
                                            <div className="col-sm-2">{run.entry_order.price}</div>
                                            <div className="col-sm-2">{run.entry_order.quantity}</div>
                                        </div>
                                        <div className="orders-content row">
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">Stop Limit</div>
                                            <div className="col-sm-2">{run.stop_limit_order.status}</div>
                                            <div className="col-sm-1">{run.stop_limit_order.side}</div>
                                            <div className="col-sm-2">{run.stop_limit_order.limit_price}</div>
                                            <div className="col-sm-2">{run.stop_limit_order.price}</div>
                                            <div className="col-sm-2">{run.stop_limit_order.quantity}</div>
                                        </div>
                                        <div className="orders-content row">
                                            <div className="col-sm-1"></div>
                                            <div className="col-sm-2">Profit</div>
                                            <div className="col-sm-2">{run.profit_order.status}</div>
                                            <div className="col-sm-1">{run.profit_order.side}</div>
                                            <div className="col-sm-2"> - </div>
                                            <div className="col-sm-2">{run.profit_order.price}</div>
                                            <div className="col-sm-2">{run.profit_order.quantity}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                    :
                    <div className="run">
                        <div className="message">Selected Algorithm Has No Active Algorithm Run</div>
                    </div>
                }

            </div>
        )
    }
}