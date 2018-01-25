import React, { Component } from 'react';

require('/imports/ui/components/debug/binance/BinanceTesting.sass')

export default class BinanceTesting extends Component {

    walletBalance(){
        Meteor.call('binance.balance');
    }

    limitOrder(){
        var limitOrderSymbol = this.refs.limitOrderSymbol.value;
        var limitOrderSide = this.refs.limitOrderSide.value;
        var limitOrderQuantity = this.refs.limitOrderQuantity.value;
        var limitOrderPrice = this.refs.limitOrderPrice.value;
        Meteor.call('binance.limitOrder', limitOrderSide, limitOrderSymbol, limitOrderQuantity, limitOrderPrice);
    }

    stopLimitOrder(){
        var stopLimitOrderSymbol = this.refs.stopLimitOrderSymbol.value;
        var stopLimitOrderSide = this.refs.stopLimitOrderSide.value;
        var stopLimitOrderQuantity = this.refs.stopLimitOrderQuantity.value;
        var stopLimitOrderPrice = this.refs.stopLimitOrderPrice.value;
        var stopLimitOrderLimitPrice = this.refs.stopLimitOrderLimitPrice.value;
        Meteor.call('binance.stopLimitOrder', stopLimitOrderSide, stopLimitOrderSymbol, stopLimitOrderQuantity, stopLimitOrderPrice, stopLimitOrderLimitPrice);
    }

    marketOrder(){

    }

    cancelOrder(){
        var cancelOrderSymbol = this.refs.cancelOrderSymbol.value;
        var cancelOrderId = this.refs.cancelOrderId.value;
        Meteor.call('binance.cancelOrder', cancelOrderSymbol, cancelOrderId);
    }

    orderStatus(){

    }

    tradeHistory(){

    }

    candlesticks(){
        Meteor.call('binance.WssCandlesticks');
    }

    userData(){
        Meteor.call('binance.wssUserData');
    }

    render(){
        return (
        <div className="content-wrapper">
            <div id="binance-testing" className="content">
                <div className="title">Binance Testing</div>
            </div>
            <div className="main-content">
                <div className="panel">
                    <h4>General API</h4>
                    <button onClick={this.walletBalance.bind(this)}>Wallet Balances</button>
                </div>
                <div className="panel">
                    <h4>Limit Order</h4>
                    <input ref="limitOrderSymbol" placeholder="Symbol"/>
                    <select ref="limitOrderSide">
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                    <input ref="limitOrderQuantity" placeholder="Quantity"/>
                    <input ref="limitOrderPrice" placeholder="Price"/>
                    <button onClick={this.limitOrder.bind(this)}>Limit Order</button>
                </div>
                <div className="panel">
                    <h4>Stop Limit Order</h4>
                    <input ref="stopLimitOrderSymbol" placeholder="Symbol"/>
                    <select ref="stopLimitOrderSide">
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                    <input ref="stopLimitOrderLimitPrice" placeholder="Limit Price"/>
                    <input ref="stopLimitOrderQuantity" placeholder="Quantity"/>
                    <input ref="stopLimitOrderPrice" placeholder="Price"/>
                    <button onClick={this.stopLimitOrder.bind(this)}>Stop Limit Order</button>
                </div>
                <div className="panel">
                    <h4>Cancel Order</h4>
                    <input ref="cancelOrderSymbol" placeholder="Symbol"/>
                    <input ref="cancelOrderId" placeholder="OrderId"/>
                    <button onClick={this.cancelOrder.bind(this)}>Cancel Order</button>
                </div>
                <div className="panel">
                    <h4>Candle Stick Chart Data</h4>
                    <button onClick={this.candlesticks.bind(this)}>Candle Sticks</button>
                </div>
                <div className="panel">
                    <h4>User Data</h4>
                    <button onClick={this.userData.bind(this)}>User Data</button>
                </div>
                <div className="panel">
                    <h4>Set Orders Input</h4>
                    <div className="subPanels">

                    </div>
                    <div className="subPanels">

                    </div>
                    <div className="subPanels">

                    </div>
                </div>
            </div>
        </div>

        )
    }
}