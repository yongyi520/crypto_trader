import React, { Component } from 'react';

import classNames from 'classnames'

import 'react-switch-button/dist/react-switch-button.css';
require('/imports/ui/components/algorithm-settings/AlgorithmSettings.sass')

export class AlgorithmSettings extends Component {

    updateAlgorithmSettings(){
        var updateAlgorithmSettingsData = {
            start_amount: parseFloat(this.refs.startAmount.value),
            step_size: parseFloat(this.refs.stepSize.value),
            buy_back: parseFloat(this.refs.buyBack.value)
        }
        console.log("update algorithm data", updateAlgorithmSettingsData);
        Meteor.call("updateAlgorithmSettings", this.props.settings._id, updateAlgorithmSettingsData)
    }

    algorithmOnOff(state){
        if(state == true){
            Meteor.call("turnOnAlgorithm", this.props.settings._id)
        } else if(state == false) {
            Meteor.call("turnOffAlgorithm", this.props.settings._id)
        }
    }

    render(){
        console.log("algorithm settings", this.props.settings);
        return (
            <div id="algorithm-setting-panel">
                { this.props.settings ?
                    <div className="settings">
                        <div className="settings-row">
                            <div className="field_name">On / Off</div>
                            <div className="input">
                                <button onClick={() => this.algorithmOnOff(true)} className={classNames({on: this.props.settings.is_active})}>ON</button>
                                <button onClick={() => this.algorithmOnOff(false)} className={classNames({off: !this.props.settings.is_active})}>OFF</button>
                            </div>

                        </div>
                        <div className="settings-row">
                            <div className="field_name">Start Amount</div>
                            <div className="input">
                                <input ref="startAmount" type="text" key={this.props.settings._id} defaultValue={this.props.settings.start_amount}/>
                            </div>
                        </div>
                        <div className="settings-row">
                            <div className="field_name">Step Size</div>
                            <div className="input">
                                <input ref="stepSize" type="text" key={this.props.settings._id} defaultValue={this.props.settings.step_size}/>
                            </div>
                        </div>
                        <div className="settings-row">
                            <div className="field_name">Buy Back</div>
                            <div className="input">
                                <input ref="buyBack" type="text" key={this.props.settings._id} defaultValue={this.props.settings.buy_back}/>
                            </div>
                        </div>
                        <div className="settings-action-panel">
                            <button onClick={() => this.updateAlgorithmSettings()}>Update</button>
                        </div>
                    </div>
                    :
                    <div className="settings">
                        <div className="message">
                            Selected Algorithm Has No Algorithm Settings
                        </div>
                    </div>
                }
            </div>
        )
    }
}