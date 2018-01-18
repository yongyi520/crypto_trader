import React, { Component } from 'react';

require('/imports/ui/components/debug/BitfinexTesting.sass')

export default class BitfinexTesting extends Component {

    martingaleNextOrders(){
        var order_id = parseInt(this.refs.orderId.value);
        Meteor.call("bitfinex.martingaleNextOrders", order_id);
    }

    getWalletBalances(){
        Meteor.call("bitfinex.getWalletBalances");
    }

    getAllSymbols(){
        Meteor.call("bitfinex.getAllSymbols");
    }

    getMyActivePositions(){
        Meteor.call("bitfinex.getMyActivePositions");
    }

    getOrderBook(){
        Meteor.call("bitfinex.getOrderBook");
    }

    getActiveOrders(){
        Meteor.call("bitfinex.getMyActiveOrders");
    }

    getMyOrderStatus(){
        Meteor.call("bitfinex.getMyOrderStatus");
    }

    newOrder(){
        Meteor.call("bitfinex.newOrder");
    }

    replaceOrder(){
        Meteor.call("bitfinex.replaceOrder");
    }

    cancelOrder(){
        Meteor.call("bitfinex.cancelOrder");
    }

    restartSocket(){
        Meteor.call('bitfinex.restartSocket')
    }

    openSocket(){
        Meteor.call("bitfinex.openSocket");
    }

    ping(){
        Meteor.call("bitfinex.ping");
    }

    isSocketAlive(){
        Meteor.call("bitfinex.isSocketAlive", (error, alive) => {
            if(alive){
                alert("the socket is live")
            } else {
                alert("the socket is dead")
            }
        });
    }

    martingaleShblETHUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'ethusd');
    }

    martingaleShblETHBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'ethbtc');
    }

    martingaleShblOMGUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'omgusd');
    }

    martingaleShblOMGBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'omgbtc');
    }

    martingaleShblNEOUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'neousd');
    }

    martingaleShblNEOBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'neobtc');
    }

    martingaleShblXRPUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'xrpusd');
    }

    martingaleShblXRPBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'xrpbtc');
    }

    martingaleBlshETHUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'ethusd');
    }

    martingaleBlshETHBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'ethbtc');
    }

    martingaleBlshOMGUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'omgusd');
    }

    martingaleBlshOMGBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'omgbtc');
    }

    martingaleBlshNEOUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'neousd');
    }

    martingaleBlshNEOBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'neobtc');
    }

    martingaleBlshXRPUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'xrpusd');
    }

    martingaleBlshXRPBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'xrpbtc');
    }

    dailyShblBTCUSD(){
        Meteor.call("bitfinex.dailySHBL", 'btcusd');
    }

    dailyShblOMGUSD(){
        Meteor.call("bitfinex.dailySHBL", 'omgusd');
    }

    dailyShblNEOUSD(){
        Meteor.call("bitfinex.dailySHBL", 'neousd');
    }

    dailyBlshBTCUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'btcusd');
    }

    dailyBlshOMGUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'omgusd');
    }

    dailyBlshNEOUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'neousd');
    }

    wssListenerSetup(){
        Meteor.call("bitfinex.wssListenerSetup");
    }

    allOrders(){
        Meteor.call("allOrders");
    }

    removeNonActiveAlgorithmRunOrders(){
        Meteor.call("removeNonActiveAlgorithmRunOrders");
    }

    resetOrders(){
        Meteor.call("resetOrders");
    }

    allAlgorithms(){
        Meteor.call("allAlgorithms");
    }

    resetAlgorithms(){
        Meteor.call("resetAlgorithms");
    }

    addAlgorithm(){
        Meteor.call("addAlgorithm");
    }

    allAlgorithmSettings(){
        Meteor.call("allAlgorithmSettings")
    }

    resetAlgorithmSettings(){
        Meteor.call("resetAlgorithmSettings")
    }

    allAlgorithmRuns(){
        Meteor.call("allAlgorithmRuns")
    }

    removeNonActiveAlgorithmRun(){
        Meteor.call("removeNonActiveAlgorithmRuns");
    }

    removeETHAlgorithmRuns(){

    }

    removeOMGAlgorithmRuns(){
        Meteor.call("removeAlgorithmRuns", "bitfinex", "omgusd");
    }

    resetAlgorithmRuns(){
        Meteor.call("resetAlgorithmRuns")
    }

    manualOrderCalculator(inputChanged){
        var budgetSize = parseFloat(this.refs.budgetSize.value);
        var entryPrice = parseFloat(this.refs.entryPrice.value);
        var entryOrderSide = this.refs.entryOrderSideInput.value;
        var entryOrderSideMultiplier = this.refs.entryOrderSideInput.value == "buy" ? 1 : -1;
        var stopLossPercentage = parseFloat(this.refs.stopLossPercentage.value)/100;
        var stopLossPrice = parseFloat(this.refs.stopLossPrice.value);
        var profitPercentage = parseFloat(this.refs.profitPercentage.value)/100;
        var profitPrice = parseFloat(this.refs.profitPrice.value);

        var profitOrderSide = entryOrderSide == 'buy' ? 'sell' : (entryOrderSide == 'sell' ? 'buy' : 'N/A');
        var stopLossOrderSide = entryOrderSide;
        console.log(inputChanged, "value changed");
        console.log("entry order side", entryOrderSide);
        console.log("profit order side", profitOrderSide);
        console.log("stop loss order side", stopLossOrderSide);

        if(this.hasRequiredManualOrderInputs(inputChanged)){
            if(inputChanged == "stopLossPercentage"){
                stopLossPrice = entryPrice - entryPrice * stopLossPercentage * entryOrderSideMultiplier;
                this.refs.stopLossPrice.value = (stopLossPrice).toFixed(5);
            } else if (inputChanged == "stopLossPrice"){
                stopLossPercentage = (Math.abs(stopLossPrice / entryPrice - 1) * 100).toFixed(2);
                console.log("stop loss percentage", stopLossPercentage)
                this.refs.stopLossPercentage.value = (stopLossPercentage).toFixed(2);
            } else {
                console.log("else statement");
                stopLossPrice = entryPrice - entryPrice * stopLossPercentage * entryOrderSideMultiplier;
                this.refs.stopLossPrice.value = (stopLossPrice).toFixed(5);
            }

            if(inputChanged == "profitPercentage"){
                profitPrice = entryPrice + entryPrice * profitPercentage * entryOrderSideMultiplier;
                this.refs.profitPrice.value = profitPrice.toFixed(5);
            } else if (inputChanged == "profitPrice"){
                profitPercentage = (Math.abs(profitPrice / entryPrice - 1) * 100).toFixed(2);
                this.refs.profitPercentage.value = profitPercentage;
            } else {
                profitPrice = entryPrice + entryPrice * profitPercentage * entryOrderSideMultiplier;
                this.refs.profitPrice.value = profitPrice.toFixed(5);
            }

            var amount = (budgetSize) / Math.abs(entryPrice - stopLossPrice);



            this.refs.entryOrderPrice.value = entryPrice;
            this.refs.entryOrderAmount.value = amount;
            this.refs.entryOrderSide.value = entryOrderSide;
            this.refs.profitOrderPrice.value = profitPrice;
            this.refs.profitOrderAmount.value = amount;
            this.refs.profitOrderSide.value = profitOrderSide;
            this.refs.stopLossOrderPrice.value = stopLossPrice;
            this.refs.stopLossOrderAmount.value = amount;
            this.refs.stopLossOrderSide.value = stopLossOrderSide;

            var budgetUsed = amount * entryPrice;
            var potentialLoss = amount * (stopLossPrice - entryPrice) * entryOrderSideMultiplier;
            var potentialProfit = amount * (profitPrice - entryPrice) * entryOrderSideMultiplier;
            this.refs.budgetUsed.value = budgetUsed;
            this.refs.potentialProfit.value = potentialProfit;
            this.refs.potentialLoss.value = potentialLoss;
        }
    }

    hasRequiredManualOrderInputs(inputChanged){
        var budgetSize = this.refs.budgetSize.value != "";
        var entryPrice = this.refs.entryPrice.value != "";
        var stopLossPercentage = this.refs.stopLossPercentage.value != "";
        var stopLossPrice = this.refs.stopLossPrice.value != "";
        var profitPercentage = this.refs.profitPercentage.value != "";
        var profitPrice = this.refs.profitPrice.value != "";

        return budgetSize && entryPrice &&
            ((stopLossPercentage) || (stopLossPrice)) &&
            ((profitPercentage) || (profitPrice));
    }

    render() {
        return (
            <div className="content-wrapper">
                <div id="bitfinex-testing" className="content">
                    <div className="title">
                        <h2>Bitfinex Testing</h2>
                    </div>
                    <div className="main-content">
                        <div className="panel">
                            <h4>Manual Order</h4>
                            <div className="panel-row">
                                <div className="panel-inputs">
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Entry Price</h6>
                                            <input onChange={() => this.manualOrderCalculator("entryPrice")} ref="entryPrice" type="number"/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Side</h6>
                                            <select ref="entryOrderSideInput" onChange={() => this.manualOrderCalculator("entryOrderSideInput")}>
                                                <option value="buy">buy</option>
                                                <option value="sell">sell</option>
                                            </select>
                                        </div>
                                    </div>
                                    <h6>Amount Willing to Lose</h6>
                                    <input onChange={() => this.manualOrderCalculator("budgetSize")} ref="budgetSize" type="number"/>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Stop Loss %</h6>
                                            <input onChange={() => this.manualOrderCalculator("stopLossPercentage")} ref="stopLossPercentage" type="number"/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Stop Loss Price</h6>
                                            <input onChange={() => this.manualOrderCalculator("stopLossPrice")} ref="stopLossPrice" type="number"/>
                                        </div>
                                    </div>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Profit %</h6>
                                            <input onChange={() => this.manualOrderCalculator("profitPercentage")} ref="profitPercentage" type="number"/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Profit Price</h6>
                                            <input onChange={() => this.manualOrderCalculator("profitPrice")} ref="profitPrice" type="number"/>
                                        </div>
                                    </div>

                                </div>
                                <div className="panel-outputs">
                                    <h6>Entry Order</h6>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Price</h6>
                                            <input ref="entryOrderPrice" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Amount</h6>
                                            <input ref="entryOrderAmount" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Side</h6>
                                            <input ref="entryOrderSide" disabled={true} />
                                        </div>

                                    </div>
                                    <h6>Profit Order</h6>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Price</h6>
                                            <input ref="profitOrderPrice" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Amount</h6>
                                            <input ref="profitOrderAmount" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Side</h6>
                                            <input ref="profitOrderSide" disabled={true} />
                                        </div>
                                    </div>
                                    <h6>Stop Loss Order</h6>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Price</h6>
                                            <input ref="stopLossOrderPrice" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Amount</h6>
                                            <input ref="stopLossOrderAmount" disabled={true} value={0}/>
                                        </div>
                                        <div className="panel-row-block">
                                            <h6>Side</h6>
                                            <input ref="stopLossOrderSide" disabled={true} />
                                        </div>
                                    </div>
                                </div>
                                <div className="panel-outputs">
                                    <h6>Money Details</h6>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Budget Used</h6>
                                            <input ref="budgetUsed" disabled={true} value={0}/>
                                        </div>
                                    </div>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Potential Profit</h6>
                                            <input ref="potentialProfit" disabled={true} value={0}/>
                                        </div>
                                    </div>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Potential Loss</h6>
                                            <input ref="potentialLoss" disabled={true} value={0}/>
                                        </div>
                                    </div>
                                    <div className="panel-row">
                                        <div className="panel-row-block">
                                            <h6>Risk Reward Ratio</h6>
                                            <input onChange={() => this.manualOrderCalculator("rewardRatio")} ref="rewardRatio" type="number"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="panel">
                            <h4>Troubleshoot</h4>
                            <input ref="orderId" type="number"/>
                            <button onClick={this.martingaleNextOrders.bind(this)}>Martingale Next Orders</button>
                        </div>
                        <div className="panel">
                            <h4>API General Calls</h4>
                            <button onClick={this.getWalletBalances.bind(this)}>Wallet Balances</button>
                            <button onClick={this.getAllSymbols.bind(this)}>All Symbols</button>
                        </div>
                        <div className="panel">
                            <h4>API Order Calls</h4>
                            <button onClick={this.getMyActivePositions.bind(this)}>Active Positions</button>
                            <button onClick={this.getOrderBook.bind(this)}>Order Book</button>
                            <button onClick={this.getActiveOrders.bind(this)}>Active Orders</button>
                            <button onClick={this.getMyOrderStatus.bind(this)}>Order Status</button>
                            <button onClick={this.newOrder.bind(this)}>New Order</button>
                            <button onClick={this.replaceOrder.bind(this)}>Replace Order</button>
                            <button onClick={this.cancelOrder.bind(this)}>Cancel Order</button>
                        </div>
                        <div className="panel">
                            <h4>WSS Calls</h4>
                            <button onClick={this.restartSocket.bind(this)}>Restart Socket</button>
                            <button onClick={this.openSocket.bind(this)}>Open Socket</button>
                            <button onClick={this.ping.bind(this)}>Ping</button>
                            <button onClick={this.isSocketAlive.bind(this)}>Is Socket Alive</button>
                        </div>
                        <div className="panel">
                            <h4>Martingale Algorithm Test</h4>
                            <h5>SHBL</h5>
                            <button onClick={this.martingaleShblETHUSD.bind(this)}>ETHUSD</button>
                            <button onClick={this.martingaleShblETHBTC.bind(this)}>ETHBTC</button>
                            <button onClick={this.martingaleShblOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.martingaleShblOMGBTC.bind(this)}>OMGBTC</button>
                            <button onClick={this.martingaleShblNEOUSD.bind(this)}>NEOUSD</button>
                            <button onClick={this.martingaleShblNEOBTC.bind(this)}>NEOBTC</button>
                            <button onClick={this.martingaleShblXRPUSD.bind(this)}>XRPUSD</button>
                            <button onClick={this.martingaleShblXRPBTC.bind(this)}>XRPBTC</button>
                            <h5>BLSH</h5>
                            <button onClick={this.martingaleBlshETHUSD.bind(this)}>ETHUSD</button>
                            <button onClick={this.martingaleBlshETHBTC.bind(this)}>ETHBTC</button>
                            <button onClick={this.martingaleBlshOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.martingaleBlshOMGBTC.bind(this)}>OMGBTC</button>
                            <button onClick={this.martingaleBlshNEOUSD.bind(this)}>NEOUSD</button>
                            <button onClick={this.martingaleBlshNEOBTC.bind(this)}>NEOBTC</button>
                            <button onClick={this.martingaleBlshXRPUSD.bind(this)}>XRPUSD</button>
                            <button onClick={this.martingaleBlshXRPBTC.bind(this)}>XRPBTC</button>
                        </div>
                        <div className="panel">
                            <h4>Daily Algorithm Test</h4>
                            <h5>SHBL</h5>
                            <button onClick={this.dailyShblBTCUSD.bind(this)}>BTCUSD</button>
                            <button onClick={this.dailyShblOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.dailyShblNEOUSD.bind(this)}>NEOUSD</button>
                            <h5>BLSH</h5>
                            <button onClick={this.dailyBlshBTCUSD.bind(this)}>BTCUSD</button>
                            <button onClick={this.dailyBlshOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.dailyBlshNEOUSD.bind(this)}>NEOUSD</button>
                        </div>
                        <div className="panel">
                            <h4>Orders Collection</h4>
                            <button onClick={this.allOrders.bind(this)}>All Orders</button>
                            <button onClick={this.removeNonActiveAlgorithmRunOrders.bind(this)}>Remove Non Active Algorithm Run Orders</button>
                            <button onClick={this.resetOrders.bind(this)}>Reset Orders</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Collection</h4>
                            <button onClick={this.allAlgorithms.bind(this)}>All Algorithms</button>
                            <button onClick={this.resetAlgorithms.bind(this)}>Reset Algorithms</button>
                            <button onClick={this.addAlgorithm.bind(this)}>Add Algorithm</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Settings Collection</h4>
                            <button onClick={this.allAlgorithmSettings.bind(this)}>All Algorithms Settings</button>
                            <button onClick={this.resetAlgorithmSettings.bind(this)}>Reset Algorithms Settings</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Runs Collection</h4>
                            <button onClick={this.allAlgorithmRuns.bind(this)}>All Algorithms Runs</button>
                            <button onClick={this.removeNonActiveAlgorithmRun.bind(this)}>Remove Non-Active Algorithm Runs</button>
                            <button onClick={this.removeETHAlgorithmRuns.bind(this)}>Remove ETH Algorithm Runs</button>
                            <button onClick={this.removeOMGAlgorithmRuns.bind(this)}>Remove OMG Algorithm Runs</button>
                            <button onClick={this.resetAlgorithmRuns.bind(this)}>Reset Algorithms Runs</button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}