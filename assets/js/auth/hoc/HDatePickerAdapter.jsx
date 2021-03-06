/**
 * Adapter to use HDatePicker as a widget using a redux container to dynamically pass and update props
 */


import React, { Component } from "react";
import HDatePicker from "../../shared/organisms/HDatePicker";
import {createStore,applyMiddleware} from "redux";
import {connect,Provider} from "react-redux";
import thunk from 'redux-thunk';
const SET_PROP = 'SET_PROP';
//const middleware = [ thunk ];

const Imm = require("immutable");


const reducer = (state=Imm.Map({}), action={}) =>{
    //console.log('reducer state',state);
    for (let prop in action.props) {
        if (Object.prototype.hasOwnProperty.call(action.props, prop)) {
            state = state.set(prop,action.props[prop]);
        }
    }
    return state;
};

const store = createStore(
    reducer,
    applyMiddleware(thunk)
);

class HDatePickerAdapterComponent extends Component {
    constructor(props) {
        super(props);
        // give dispatch back to widget
        if(props.setDispatch){
            props.setDispatch(props.dispatch);
        }
        console.log("HDatePickerAdapterComponent build");
    }

    render(){
        //console.log('reducer state',this.props);

        let {initialValue,onFocus,onClose,onSave,containerProps,setContainerRef,style} = this.props;

        initialValue = containerProps.has("initialValue")?containerProps.get("initialValue"):null;
        onFocus = containerProps.has("onFocus")?containerProps.get("onFocus"):null;
        onClose = containerProps.has("onClose")?containerProps.get("onClose"):null;
        onSave = containerProps.has("onSave")?containerProps.get("onSave"):null;
        style = containerProps.has("style")?containerProps.get("style"):null;

        return (<HDatePicker {...this.props}
                             initialValue={initialValue}
                             onFocus={onFocus}
                             onClose={onClose}
                             onSave={onSave}
                             setContainerRef={setContainerRef}
                             style={style}
        />);
    }
}

const ConnectedHDatePickerAdapter = connect((state)=>({containerProps:state}))(HDatePickerAdapterComponent);

class Adapter extends Component{
    constructor(props) {super(props);}

    render(){
        return (
            <Provider store={store}><ConnectedHDatePickerAdapter {...this.props}/></Provider>)
    }
};

export const HDatePickerAdapter = Adapter;
