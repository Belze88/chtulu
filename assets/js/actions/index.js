import SearchBag from '../util/SearchBag';
import {
    HTTP_POST,
    URL_GET,
    URL_GET_ONE_BY_ID,
    URL_GET_NEW,
    getUrl,
    getHTTPProps,
    getHBProps,
    DataToPost,
    HB_SUCCESS,
    HB_ERROR,
    URL_POST
} from '../util/server';
import { normalize,denormalize, schema } from 'normalizr';
import WAOs from '../util/WAOs';
import {getDataToPost} from '../util/WAOUtil';
import GroupUtil from "../util/GroupUtil";
import SearchBagUtil from '../util/SearchBagUtil';
import {entitiesSelector,getPendingTotalSelector} from '../selectors';
import {LOADING,LOADING_COMPLETED,SUBMITTING,SUBMITTING_COMPLETED} from '../util/notifications';

// notifications actions
export const NOTIFY = 'NOTIFY';
export const DISCARD = 'DISCARD';
// data reception actions
export const GET = 'GET';
export const RECEIVE_GET = 'RECEIVE_GET';
export const RECEIVE_NEW = 'RECEIVE_NEW';
export const GET_ONE_BY_ID = 'GET_ONE_BY_ID';
export const RECEIVE_GET_ONE_BY_ID = 'RECEIVE_GET_ONE_BY_ID';
// data creation and removal
export const CREATE_NEW = 'CREATE_NEW';
export const DELETE = 'DELETE';
// form actions
export const SUBMIT_LOCALLY = 'SUBMIT_LOCALLY';
export const RESET = 'RESET';
export const ADD_PENDING = 'ADD_PENDING';
export const REMOVE_PENDING = 'REMOVE_PENDING';
export const RESET_ALL_PENDING = 'RESET_ALL_PENDING';
// submission to server actions
export const POST_ONE = 'POST_ONE';
export const POST_ALL = 'POST_ALL';

export const TIMEOUT = 5000;


export const notify = (notifType,senderKey=null,senderParam=null,status=HB_SUCCESS) => ({
    type: NOTIFY,
    notifType : notifType,
    senderKey : senderKey || 'HBAPP',
    senderParam: senderParam,
    status:status
});

export const discard = (notifType,senderKey=null,senderParam=null) => ({
    type: DISCARD,
    notifType : notifType,
    senderKey : senderKey || 'HBAPP',
    senderParam: senderParam
});

/**
 * @param url string
 * @param props object
 * @param timeout integer
 * @returns {Promise<any>}
 */
const fetchWithTimeout = function( url,props, timeout=TIMEOUT ) {
    return new Promise( (resolve, reject) => {
        // Set timeout timer
        let timer = setTimeout(
            () => reject( new Error('Request timed out') ),
            timeout
        );

        fetch( url ,props).then(
            response => resolve( response ),
            err => reject( err )
        ).finally( () => clearTimeout(timer) );
    })
};


export const postOne = (waoType,groups=true,id,senderKey) => (dispatch,getState) => {
    console.log("postOne");


    const state = getState();
    let entities = entitiesSelector(state);
    //entities = {articleType:{'2':{id:2,label:"lol"}},resource:{}};
    /*console.log("entities");
    console.log(entities);
    console.log("schema");
    console.log(WAOs.getIn([waoType,"schema"]));*/
    let normData = state.getIn([waoType,"items",+id]);
    console.log(`denormData to send ${id}`);
    console.log(normData);
    console.log(`normData to send ${id}`);
    //normData.type=2;
    normData = denormalize(normData,WAOs.getIn([waoType,"schema"]),entities);
    normData = normData.toJS();
    /*console.log(normData);
    console.log("groups to send");
    console.log(groups);*/
    if(!groups){
        groups = state.getIn(["app","entitiesToPost",waoType,+id]) || true;
    }
    normData = getDataToPost(waoType,normData,groups);
    /*console.log(`partial normData to send ${id}`);
    console.log(normData);*/

    let dataToPost = DataToPost().add(waoType,id,normData);
    console.log(`dataToPost`);
    console.log(dataToPost);

    const url = getUrl(URL_POST);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    //console.log(httpProps);

    dispatch(notify(SUBMITTING,senderKey || 'HBAPP',id));

    return fetch(url,httpProps)
        .then(response => response.json())
        .then(json => {
            console.log("post returned !");
            json.data = JSON.parse(json.data);
            console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey || 'HBAPP',id,HB_SUCCESS));
                        handlePostBackData(json.data,dispatch);
                        //dispatch(receiveGet(waoType,groups,searchBag,json.rows,json.total,json.message));
                        break;
                    case HB_ERROR:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey || 'HBAPP',id,HB_ERROR));
                        //dispatch(errorGet(waoType,groups,searchBag,json.message));
                        break;
                    default:
                }
            }
        )
};

export const postAll = (senderKey=null) => (dispatch,getState) => {
    const state = getState();
    const pendingTotalSelector = getPendingTotalSelector(state.get("app"));
    if(pendingTotalSelector()<1) return;

    let entities = entitiesSelector(state);
    let dataToPost = DataToPost();//.add(waoType,id,normData);
    state.getIn(["app","entitiesToPost"]).entrySeq().forEach((entry)=>{
        let waoType = entry[0];
        let items = entry[1];
        items.entrySeq().forEach((entry)=>{
            let id = entry[0];
            let groups = entry[1];
            let normData = state.getIn([waoType,"items",+id]);
            normData = denormalize(normData,WAOs.getIn([waoType,"schema"]),entities);
            normData = normData.toJS();
            normData = getDataToPost(waoType,normData,groups);
            dataToPost.add(waoType,id,normData);
        });
    });

    console.log(`dataToPost ALL !`);
    console.log(dataToPost);

    const url = getUrl(URL_POST);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    dispatch(notify(SUBMITTING,senderKey || 'HBAPP',null));

    return fetch(url,httpProps)
        .then(response => response.json())
        .then(json => {
                console.log("post returned !");
                json.data = JSON.parse(json.data);
                console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey || 'HBAPP',null,HB_SUCCESS));
                        handlePostBackData(json.data,dispatch);
                        //dispatch(receiveGet(waoType,groups,searchBag,json.rows,json.total,json.message));
                        break;
                    case HB_ERROR:
                        //dispatch(errorGet(waoType,groups,searchBag,json.message));
                        break;
                    default:
                }
            }
        )
};



const handlePostBackData = (backData,dispatch) =>{
    Object.keys(backData).forEach((waoType)=>{
        Object.keys(backData[waoType]).forEach((id)=>{
            let object = backData[waoType][id];
            let groups = object.backGroups;
            let postedGroups = object.loadedGroups;
            object.loadedGroups = groups;
            object.postedGroups = postedGroups;
            //receiveGetOneById = (waoType,groups,id,data,message="Données bien recues du serveur")
            console.log("redispatched object after post");
            console.log(object);
            dispatch(removePending(waoType,id,object.toDelete?null:postedGroups));
            dispatch(receiveGetOneById(waoType,groups,id,object,"Données bien enregistrées sur le serveur"));
        });
    });
};

export const addPending = (waoType,id,groups) => ({
        type: ADD_PENDING,
        waoType: waoType,
        groups: groups,
        id: id
    }
);

export const removePending = (waoType,id,groups) => ({
        type: REMOVE_PENDING,
        waoType: waoType,
        groups: groups,
        id: id
    }
);

export const submitLocally = (waoType,data,id,groups) => (dispatch,state) => {
    dispatch(addPending(waoType,id,groups));
    return dispatch({
        type: SUBMIT_LOCALLY,
        waoType: waoType,
        data: data,
        id: id
    });
};

export const reset = (waoType,ids,groups) => (dispatch,state) =>{
    ids.forEach((id)=>{
        setTimeout(()=>dispatch(removePending(waoType,id,groups)),10);
    });

    return dispatch({
            type: RESET,
            waoType : waoType,
            ids : ids
        });
};

export const deleteLocally = (waoType,ids) => (dispatch,state) => {
    ids.forEach((id)=>{
        if(+id> 0 ) dispatch(addPending(waoType,id,'minimal'));
        else dispatch(removePending(waoType,id,null));
    });
    return dispatch({
        type: DELETE,
        waoType: waoType,
        ids: ids
    });
};

export const resetAll = (waoType,ids,groups) => (dispatch,getState) =>{
    const state = getState();
    const pendingTotalSelector = getPendingTotalSelector(state.get("app"));
    if(pendingTotalSelector()<1) return;

    let entities = entitiesSelector(state);
    let dataToPost = DataToPost();//.add(waoType,id,normData);
    state.getIn(["app","entitiesToPost"]).entrySeq().forEach((entry)=>{
        let waoType = entry[0];
        let items = entry[1];
        items.entrySeq().forEach((entry)=>{
            let id = entry[0];
            let groups = entry[1];
            dispatch(removePending(waoType,id,groups));
            let normData = state.getIn([waoType,"items",+id]);
            normData = denormalize(normData,WAOs.getIn([waoType,"schema"]),entities);
            normData = normData.toJS();
            normData = getDataToPost(waoType,normData,groups);
            dataToPost.add(waoType,id,normData);
        });
    });

    // effectively remove all pending data recursively
    /*console.log("data to reset");
    console.log(dataToPost);*/

    Object.keys(dataToPost.waos).forEach((waoType)=>{
        const normData = normalize(dataToPost.waos[waoType],[WAOs.getIn([waoType,"schema"])]);
        /*console.log("renormalized data");
        console.log(normData);*/
        Object.keys(normData.entities).forEach((normWaoType)=>{
            dispatch({
                type: RESET,
                waoType : normWaoType,
                ids : Object.keys(normData.entities[normWaoType])
            });
        });
    });
};


export const get = (waoType,groups,searchBag=null) => ({
    type: GET,
    waoType : waoType,
    groups : groups,
    searchBag : searchBag || SearchBag()
});


const subReceiveGet = (waoType,rows) => {
    //console.log("subreceive get");
    //console.log(rows);
    const reducer = (accumulator, entity) => {
        accumulator =accumulator || true;
        let loadedGroups = entity.loadedGroups || true;
        //console.log(accumulator);
        //console.log(loadedGroups);
        return GroupUtil.intersect(waoType,accumulator,loadedGroups);
    };

    return {
        type: RECEIVE_GET,
        waoType : waoType,
        groups:rows.reduce(reducer),
        searchBag : null,
        receivedAt: Date.now(),
        total:-1,
        waos: rows,
        result:null
    }
};

export const receiveGet = (waoType,groups,searchBag,rows,
                           total,message="Données bien recues du serveur") => (dispatch,state) => {
    // let's normalize our received Data !
    const normData = normalize(rows,[WAOs.getIn([waoType,"schema"])]);
    console.log(rows);
    console.log("normalizedData");
    console.log(normData);
    Object.keys(normData.entities).forEach((key)=>{
        if(key !== waoType){
            dispatch(subReceiveGet(key,Object.values(normData.entities[key])));
        }
    });

    console.log("searchbag - result");
    console.log(searchBag);
    console.log(normData.result);

    //console.log(normData.entities[waoType]);

    return dispatch({
        type: RECEIVE_GET,
        waoType : waoType,
        groups:groups,
        searchBag : searchBag,
        receivedAt: Date.now(),
        total:total,
        waos: normData.entities[waoType]?Object.values(normData.entities[waoType]):[],
        result:normData.result
    });
};

export const errorGet = (waoType,searchBag,message) => {
    console.log(`error Get fetching ${waoType} : ${message}`);
};

const fetchGet = (waoType,groups=true,searchBag,senderKey) => (dispatch,state) => {
    const coreBagKey = JSON.stringify(SearchBagUtil.getCoreBag(searchBag));

    dispatch(notify(LOADING,senderKey || 'HBAPP',coreBagKey));

    const url = getUrl(URL_GET,getHBProps(waoType,groups,searchBag));

    return fetch(url,getHTTPProps())
        .then(response => response.json())
        .then(json => {
            switch (json.status) {
                case HB_SUCCESS:
                    dispatch(receiveGet(waoType,groups,searchBag,json.rows,json.total,json.message));
                    dispatch(notify(LOADING_COMPLETED,senderKey,coreBagKey,HB_SUCCESS));
                    break;
                case HB_ERROR:
                    dispatch(errorGet(waoType,groups,searchBag,json.message));
                    dispatch(notify(LOADING_COMPLETED,senderKey,coreBagKey,HB_ERROR));
                    break;
                default:
            }
        }
        )
};

const shouldFetchGet = (state, waoType,groups,searchBag,senderKey=null) => {
    const coreBagKey = JSON.stringify(SearchBagUtil.getCoreBag(searchBag));
    if (state.hasIn(["app","notifications",senderKey,coreBagKey,LOADING])) return false;

    const searchCacheEntry = state.getIn([waoType,"searchCache",
        JSON.stringify(SearchBagUtil.getCoreBag(searchBag))]);
    //console.log(`shouldFetchGet 0 `);
    if(!searchCacheEntry) return true;
    //console.log(`shouldFetchGet 1 `);
    let indexMap = searchCacheEntry.get("indexMap");
    indexMap = (searchBag.order===SearchBagUtil.ASC)?indexMap:
        SearchBagUtil.invertIndexMap(indexMap,searchCacheEntry.get("total"));
    /*console.log("indexMap");
    console.log(indexMap);
    console.log(searchBag);*/

    for(let i=searchBag.offset;i<searchBag.offset+searchBag.limit;i++){
        if(typeof indexMap.get(i) === 'undefined') return true;
    }
    //console.log(`shouldFetchGet 3 `);
    return false;
};

export const getIfNeeded = (waoType,groups=true,searchBag,senderKey=null) => (dispatch, getState) => {
    searchBag = searchBag || SearchBag();
    console.log(`shouldFetchGet : ${shouldFetchGet(getState(), waoType,groups,searchBag,senderKey)}`);

    if (shouldFetchGet(getState(), waoType,groups,searchBag,senderKey)) {
        return dispatch(fetchGet(waoType,groups,searchBag,senderKey))
    }
};

export const receiveGetOneById = (waoType,groups,id,data,message="Données bien recues du serveur") =>
    (dispatch,state) => {
    // let's normalize our received Data !
    console.log(`denormalizedData ${waoType} with id ${id}`);
    console.log(data);
    const normData = normalize(data,WAOs.getIn([waoType,"schema"]));
    console.log("normalizedData");
    console.log(normData);
    Object.keys(normData.entities).forEach((key)=>{
        if(key !== waoType){
            dispatch(subReceiveGet(key,Object.values(normData.entities[key])));
        }
    });

    return dispatch({
        type: RECEIVE_GET_ONE_BY_ID,
        waoType : waoType,
        groups:groups,
        id : id,
        receivedAt: Date.now(),
        wao: Object.values(normData.entities[waoType])[0],
    });
};

const fetchGetOneById = (waoType,groups=true,id,senderKey) => (dispatch,state) => {
    dispatch(notify(LOADING,senderKey,id));
    const url = getUrl(URL_GET_ONE_BY_ID,getHBProps(waoType,groups,id));

    return fetch(url,getHTTPProps())
        .then(response => response.json())
        .then(json => {
                switch (json.status) {
                    case HB_SUCCESS:
                        console.log(json);
                        dispatch(notify(LOADING_COMPLETED,senderKey,id,HB_SUCCESS));
                        dispatch(receiveGetOneById(waoType,groups,id,json.data,json.message));
                        break;
                    case HB_ERROR:
                        dispatch(notify(LOADING_COMPLETED,senderKey,id,HB_ERROR));
                        dispatch(errorGet(waoType,groups,id,json.message));
                        break;
                    default:
                }
            }
        )
};


const shouldFetchGetOneById = (state, waoType,groups,id,senderKey=null) => {
    if(state.hasIn(["app","notifications",senderKey || 'HBAPP',id || 'DEFAULT',LOADING])) return false;

    const item = state.getIn([waoType,"items",id]);
    if(!item || !item.get("loadedGroups")) return true;

    if(item.get("loadedGroups")){
        /*console.log("groupes deja charges");
        console.log(item.get("loadedGroups"));
        console.log("groupes a charger");
        console.log(groups);
        console.log("diff");*/
        let diff = GroupUtil.leftDiff(waoType,groups,item.get("loadedGroups"));
        console.log(diff);
        if(Object.keys(diff).length < 1) return false;
    }



    /*const posts = state.postsBySubreddit[subreddit]
    if (!posts) {
        return true
    }
    if (posts.isFetching) {
        return false
    }
    return posts.didInvalidate*/
    return true;
};

export const getOneByIdIfNeeded = (waoType,groups=true,id,senderKey=null) => (dispatch, getState) => {
    if (id===null) return;
    // new case
    if(+id<0){
        if(shouldFetchNew(getState(),waoType)){
            console.log(`should fetch new ${waoType}`);
            dispatch(fetchNew(waoType,id,senderKey));
        }
        else {
            setTimeout(()=>{
                if (!getState().hasIn(["article","items",+id]) && !getState().hasIn(["article","createdItemIds",+id])){
                    dispatch(createNew(waoType));
                }
            },5);
        }
    }
    // standard case
    else if (shouldFetchGetOneById(getState(), waoType,groups,id,senderKey)) {
        return dispatch(fetchGetOneById(waoType,groups,id,senderKey))
    }
};

const shouldFetchNew = (state,waoType) => {
    if (state.hasIn(["app","notifications",waoType,'DEFAULT'])) return false;
    return ! state.getIn([waoType,"newItem"]);
};

const fetchNew = (waoType,id,senderKey) => (dispatch) => {
    const url = getUrl(URL_GET_NEW,getHBProps(waoType,null,0));
    dispatch(notify(LOADING,waoType,null));
    dispatch(notify(LOADING,senderKey,id));
    return fetch(url,getHTTPProps())
        .then(response => response.json())
        .then(json => {
                switch (json.status) {
                    case HB_SUCCESS:
                        setTimeout(()=>{
                            dispatch(notify(LOADING_COMPLETED,senderKey,id,HB_SUCCESS));
                            dispatch(notify(LOADING_COMPLETED,waoType,null,HB_SUCCESS));
                            dispatch(createNew(waoType));
                        },10);
                        console.log(json);
                        dispatch(receiveNew(waoType,json.data));
                        break;
                    case HB_ERROR:
                        setTimeout(()=>{
                            dispatch(notify(LOADING_COMPLETED,senderKey,id,HB_ERROR));
                            dispatch(notify(LOADING_COMPLETED,waoType,null,HB_ERROR));
                        },10);
                        dispatch(errorGet(waoType,null,0,json.message));
                        break;
                    default:
                }
            }
        )
};

const receiveNew = (waoType,data) => ({
    type:RECEIVE_NEW,
    waoType : waoType,
    receivedAt: Date.now(),
    wao: data
});

const createNew = (waoType) => ({
    type:CREATE_NEW,
    waoType : waoType,
    receivedAt: Date.now()
});




