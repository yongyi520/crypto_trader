import React, { Component } from 'react';

require('/imports/ui/components/algorithm-runs/martingale/Martingale.sass')

export class Martingale extends Component {
    render(){
        console.log("algorithm run", this.props.algorithmRuns)
        return (
            <div id="algorithm-run-panel">
                { (this.props.algorithmRuns) ?
                    <div className="run">
                        <div className="detail">
                            <p className="detail_label">Total Amount</p>
                            <p className="detail_amount">{this.props.algorithmRuns.amount_total}</p>
                        </div>
                        <div className="detail">
                            <p className="detail_label">Executed Amount</p>
                            <p className="detail_amount">{this.props.algorithmRuns.amount_executed}</p>
                        </div>
                        <div className="detail">
                            <p className="detail_label">Remaining Amount</p>
                            <p className="detail_amount">{this.props.algorithmRuns.amount_remaining}</p>
                        </div>

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