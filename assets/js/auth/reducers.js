import { combineReducers } from 'redux-immutable'
import {
    SUBMIT_LOCALLY,
    RESET,
    DELETE
} from './actions';

import WAOs from '../util/WAOs';
import SearchBagUtil from '../util/SearchBagUtil';
import { reducer as reduxFormReducer } from "redux-form/immutable";
import Common from '../util/common';
import {appReducer,updateOnRecordReception,SearchCacheEntry} from '../shared/reducers';
import {CREATE_NEW, RECEIVE_GET, RECEIVE_GET_ONE_BY_ID, RECEIVE_NEW} from "../shared/actions";

const Imm = require("immutable");

/**
 * creates new item if its prototype is available, else does nothing
 * @param state
 * @param idGenerator
 * @returns {*}
 */
const createNew = (state,idGenerator)=>{
    if(!state.get("newItem")){
        return state;
    }

    let newId = idGenerator();
    let babyRec = state.get("newItem");
    //console.log("babyRec",babyRec);
    babyRec = babyRec.set("id",newId);
    state = state.
    setIn(["items",newId],babyRec).
    setIn(["babyItemIds",newId],newId).
    set("nextNewId",newId-1);
    return state;
};


const concreteWaoType = (waoType) => {
    const initialWaoState = Imm.Map({
        type:waoType,
        total:-1,
        nextNewId:-1,
        newItem:null,
        babyItemIds:Imm.Map(),
        createdItemIds:Imm.Map(),
        items:Imm.Map(),
        searchCache: Imm.Map()
    });
    const WAO = WAOs.getIn([waoType,"recordFactory"]);
    const idGenerator = Common.getIdGenerator(-1,-1);

    return (state=initialWaoState, action) => {
        if (action.waoType !== waoType) return state;
        //console.log("reducer call");
        switch (action.type) {
            case SUBMIT_LOCALLY:
                //if(action.id === null || !state.hasIn(["items",+action.id])) return state;
                console.log("submit locally");
                console.log(action);
                // STH 20190706 SUBMIT_LOCALLY is modified to create new element if it doesn't already exist, and update it
                if(action.id === null) return state;
                if(!state.hasIn(["items",+action.id]) && +action.id<0){state = createNew(state,idGenerator);}
                console.log(+action.id);
                console.log(state.getIn(["newItem"]));
                const oldItem = state.getIn(["items",+action.id]) || Imm.Map();
                const oldInitialValues = (oldItem && oldItem.get("initialValues")) || Imm.Map();
                let newInitialValues = Imm.Map();

                if(!!oldItem && typeof oldItem !== 'undefined'){
                    action.data.entrySeq().forEach((value,key)=>{
                        /*console.log(key);
                        console.log(value);*/
                        if(key!== 'id' && value[1]!==oldItem.get(value[0]))
                            newInitialValues = newInitialValues.set(value[0],oldItem.get(value[0]));
                    });
                }
                newInitialValues = oldInitialValues.mergeDeepWith((oldVal,newVal) => newVal, newInitialValues);
                //console.log(newInitialValues);
                console.log("oldRecord");
                console.log(oldItem);
                console.log("update");
                console.log(action.data);
                const newItem = oldItem.
                mergeWith((oldVal,newVal) => newVal, action.data).
                set("initialValues",newInitialValues);
                console.log("newRecord");
                console.log(newItem);
                const newItemDeep = oldItem.
                mergeDeepWith((oldVal,newVal) => newVal, action.data).
                set("initialValues",newInitialValues);
                console.log("newRecord with deep merge");
                console.log(newItemDeep);
                return state.setIn(["items",+action.id],newItem.set('errors',[]));
            case RESET:
                for(let id of action.ids){
                    if(state.hasIn(["items",+id])){
                        let item = state.getIn(["items",+id]);
                        if(+id < 0){
                            // deleting newly created elements
                            state = state.removeIn(["items",+id]);
                        }
                        else{
                            // nominal case
                            if(item.get("initialValues") && item.get("initialValues").size>0){
                                item = item.mergeDeepWith((oldVal,newVal) => newVal, item.get("initialValues"));
                            }
                            //let newInitialValues = item.hasIn("initialValues",null);
                            item = item.set("initialValues",null);
                            state = state.setIn(["items",+id],item);
                        }

                    }
                }
                return state;
            case DELETE:
                for(let id of action.ids){
                    if(state.hasIn(["items",+id])){
                        let newInitialValues = state.getIn(["items",+id,"initialValues"]) || Imm.Map();
                        newInitialValues = newInitialValues.set("toDelete",false);
                        if(+id>0){
                            state = state.
                            setIn(["items",+id,"toDelete"],true).
                            setIn(["items",+id,"initialValues"],newInitialValues);
                        }
                        else{
                            state = state.removeIn(["items",+id]);
                        }
                    }
                }
                return state;
            case RECEIVE_GET:
                action.waos.map(item => {
                    //console.log(item);
                    let rec = WAO(item);
                    state = updateOnRecordReception(state,rec.set("receivedAt",Date.now()));
                });
                if(action.searchBag && action.result){
                    let {offset,order} = action.searchBag;
                    let coreBag = SearchBagUtil.getCoreBag(action.searchBag);
                    let coreBagKey = JSON.stringify(coreBag);
                    if(!state.hasIn(["searchCache",JSON.stringify(coreBag)])){
                        state = state.setIn(["searchCache",coreBagKey],SearchCacheEntry(coreBagKey,action.total));
                    }
                    let indexMap = state.getIn(["searchCache",coreBagKey,"indexMap"]);
                    /*console.log("receive get");
                    console.log(action);*/
                    for(let i=0;i<action.result.length;i++){
                        //console.log('indexMap key');
                        //console.log(`order ${order} , offset ${offset} , total ${action.total}`);
                        let newStackIndex = (order===SearchBagUtil.ASC)?offset+i:action.total-(offset+i)-1;
                        //console.log(`newStackIndex ${newStackIndex}`);
                        indexMap = indexMap.set(+newStackIndex,+action.result[i]);
                    }
                    // indexMap = indexMap.sortBy((v,k)=>+k,(a,b)=>a>b?1:a<b?-1:0); TODO : check if it can work
                    let entry = state.getIn(["searchCache",coreBagKey]);
                    entry = entry.
                    set("indexMap",indexMap).
                    set("total",action.total).
                    set("receivedAt",Date.now());
                    state = state.setIn(["searchCache",coreBagKey],entry);
                }
                return state;
            case RECEIVE_GET_ONE_BY_ID:
                /*console.log("action receive get one by id");
                console.log(action);*/
                let rec = WAO(action.wao);
                state = updateOnRecordReception(state,rec.set("receivedAt",Date.now()));
                return state;
            case RECEIVE_NEW:
                /*console.log(`receiveNew ${waoType}`);
                console.log(action);*/
                let newRec = WAO(action.wao);
                newRec = newRec.get("receiveRecord")(newRec);
                state = state.set("newItem",newRec);
                return state;
            case CREATE_NEW:
                return createNew(state,idGenerator);
            default:
                return state;
        }
    }
};

let waoReducers = {};
WAOs.entrySeq().forEach(entry => {
    waoReducers[entry[0]] = concreteWaoType(entry[0]);
});

waoReducers.app =  appReducer;
waoReducers.form =  reduxFormReducer;

export const rootReducer = combineReducers(waoReducers);

