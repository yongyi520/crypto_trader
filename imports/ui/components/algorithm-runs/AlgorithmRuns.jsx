import React, { Component } from 'react';

import { Martingale } from '/imports/ui/components/algorithm-runs/martingale/Martingale.jsx';
import { SetOrders } from '/imports/ui/components/algorithm-runs/set-orders/SetOrders.jsx';

require('/imports/ui/components/algorithm-runs/AlgorithmRuns.sass')

export class AlgorithmRuns extends Component {
    render(){
        return (
            <div id="algorithm-run-panel">
                { (this.props.algorithmName == 'martingale') ?
                    <Martingale algorithmRuns={this.props.algorithmRuns}/>
                    :
                    null
                }
                { (this.props.algorithmName == 'set_orders') ?
                    <SetOrders algorithmRuns={this.props.algorithmRuns} updateAlgorithmRunSelect={this.props.updateAlgorithmRunSelect}/>

                    :
                    null
                }
            </div>
        )
    }
}