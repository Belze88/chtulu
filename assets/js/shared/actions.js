import SearchBag from '../util/SearchBag';
import {
    DataToPost,
    getHBProps,
    getHTTPProps,
    getUrl,
    HB_ERROR,
    HB_SUCCESS,
    HB_WARNING,
    HTTP_POST,
    URL_CHANGE_PASSWORD,
    URL_GET,
    URL_GET_NEW,
    URL_GET_ONE_BY_ID,
} from '../util/server';
import {normalize} from 'normalizr';
import WAOs from '../util/WAOs';
import GroupUtil from "../util/GroupUtil";
import SearchBagUtil from '../util/SearchBagUtil';
import {LOADING, LOADING_COMPLETED, SUBMITTING, SUBMITTING_COMPLETED} from '../util/notifications';

// notifications actions
export const NOTIFY_ARTICLE_SELECTION = 'NOTIFY_ARTICLE_SELECTION';
export const NOTIFY = 'NOTIFY';
export const DISCARD = 'DISCARD';
// data reception actions
export const GET = 'GET';
export const RECEIVE_GET = 'RECEIVE_GET';
export const GET_ONE_BY_ID = 'GET_ONE_BY_ID';
export const RECEIVE_GET_ONE_BY_ID = 'RECEIVE_GET_ONE_BY_ID';
// items creation
export const CREATE_NEW = 'CREATE_NEW';
export const RECEIVE_NEW = 'RECEIVE_NEW';


export const TIMEOUT = 5000;
export const notify = (notifType,
                       senderKey=null,
                       senderParam=null,
                       status=HB_SUCCESS,
                       extraData=null,
                       message='',
                       errors=null) => ({
    type: NOTIFY,
    notifType : notifType,
    senderKey : senderKey || 'HBAPP',
    senderParam: senderParam,
    status:status,
    extraData:extraData,
    message:message,
    errors:errors
});

// MAP to hold the various get called made and prevent double calls
const pendingAPICalls = new Map();

const pendingCreations = new Map();

export const discard = (notifType,senderKey=null,senderParam=null) => ({
    type: DISCARD,
    notifType : notifType,
    senderKey : senderKey || 'HBAPP',
    senderParam: senderParam
});

export const notifyArticleSelection = (id) => ({
    type: NOTIFY_ARTICLE_SELECTION,
    id:id
});

export const get = (waoType,groups,searchBag=null) => ({
    type: GET,
    waoType : waoType,
    groups : groups,
    searchBag : searchBag || SearchBag()
});

export const subReceiveGet = (waoType,rows) => {
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
    /*console.log(rows);
    console.log("normalizedData");
    console.log(normData);*/
    Object.keys(normData.entities).forEach((key)=>{
        if(key !== waoType){
            dispatch(subReceiveGet(key,Object.values(normData.entities[key])));
        }
    });

    /*console.log("searchbag - result");
    console.log(searchBag);
    console.log(normData.result);*/

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
    console.error(`error Get fetching ${waoType} : ${message}`);
};

export const getIfNeeded = (waoType, groups = true, searchBag, senderKey = null) => (dispatch, getState) => {
    searchBag = searchBag || SearchBag();
    //console.log(`shouldFetchGet : ${shouldFetchGet(getState(), waoType,groups,searchBag,senderKey)}`);

    if (shouldFetchGet(getState(), waoType, groups, searchBag, senderKey)) {
        return dispatch(fetchGet(waoType, groups, searchBag, senderKey))
    }
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
    if(!searchCacheEntry || searchCacheEntry.get('invalidatedAt') !== null) return true;
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

// export const getIfNeeded = (waoType,groups=true,searchBag,senderKey=null) => (dispatch, getState) => {
//     searchBag = searchBag || SearchBag();
//     //console.log(`shouldFetchGet : ${shouldFetchGet(getState(), waoType,groups,searchBag,senderKey)}`);
//
//     if (shouldFetchGet(getState(), waoType,groups,searchBag,senderKey)) {
//         return dispatch(fetchGet(waoType,groups,searchBag,senderKey))
//     }
// };

export const receiveGetOneById = (waoType,groups,id,data,message="Données bien recues du serveur") =>
    (dispatch,state) => {
        // let's normalize our received Data !
        /*console.log(`denormalizedData ${waoType} with id ${id}`);
        console.log(data);*/
        const normData = normalize(data,WAOs.getIn([waoType,"schema"]));
        /*console.log("normalizedData");
        console.log(normData);*/
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


export const changePassword = (data, senderKey) => (dispatch, getState) => {
    console.log("change password");
    console.log(data);

    let dataToPost = DataToPost(senderKey);
    dataToPost.email = data.email;
    dataToPost.password = data.password;
    dataToPost.token = data.token;
    dataToPost.isAlreadyAuthenticated = data.isAlreadyAuthenticated || false;
    console.log(`dataToPost`);
    console.log(dataToPost);

    const url = getUrl(URL_CHANGE_PASSWORD);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    dispatch(notify(SUBMITTING, senderKey, 0));

    return fetch(url, httpProps)
        .then(response => response.json())
        .catch(exception => {
                dispatch(notify(SUBMITTING_COMPLETED, senderKey, 0, HB_ERROR, null, "Le serveur est tombé en erreur :(", null));
            }
        )
        .then(json => {
                console.log("post returned !");
                console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED, senderKey, 0, HB_SUCCESS, json.data, json.message));
                        break;
                    case HB_ERROR:
                        console.error(json.message);
                        console.log(json.errors);
                        dispatch(notify(SUBMITTING_COMPLETED, senderKey, 0, HB_ERROR, json.data, json.message, json.errors));
                        break;
                    case HB_WARNING:
                        console.warn(json.message);
                        dispatch(notify(SUBMITTING_COMPLETED, senderKey, 0, HB_WARNING, json.data, json.message, json.errors));
                        break;
                    default:
                }
            }
        )
};

const fetchGetOneById = (waoType, groups = true, id, senderKey) => (dispatch, state) => {
    pendingAPICalls.set(APICallKey('getOneById', waoType, groups, id), new Date());
    dispatch(notify(LOADING, senderKey, id));
    const url = getUrl(URL_GET_ONE_BY_ID, getHBProps(waoType, groups, id));

    return fetch(url, getHTTPProps())
        .then(response => response.json())
        .then(json => {
                pendingAPICalls.delete(APICallKey('getOneById', waoType, groups, id));
                switch (json.status) {
                    case HB_SUCCESS:
                        console.info(json);
                        dispatch(notify(LOADING_COMPLETED, senderKey, id, HB_SUCCESS));
                        dispatch(receiveGetOneById(waoType, groups, id, json.data, json.message));
                        break;
                    case HB_ERROR:
                        dispatch(notify(LOADING_COMPLETED, senderKey, id, HB_ERROR));
                        dispatch(errorGet(waoType, groups, id, json.message));
                        break;
                    default:
                }
            }
        )
};

const APICallKey = (callType, waoType, groups = true, id = null, searchBag = null) => {
    switch (callType) {
        case 'getOneById' :
            return `${waoType}_${id}_${JSON.stringify(groups)}`;
        default :
            return 'NA';
    }
};



const shouldFetchGetOneById = (state, waoType, groups, id, senderKey = null) => {
    if (pendingAPICalls.has(APICallKey('getOneById', waoType, groups, id))) return false;
    if (state.hasIn(["app", "notifications", senderKey || 'HBAPP', id || 'DEFAULT', LOADING])) return false;

    const item = state.getIn([waoType, "items", id]);
    if (!item || !item.get("loadedGroups")) return true;

    if (item.get("loadedGroups")) {
        /*console.log("groupes deja charges");
        console.log(item.get("loadedGroups"));
        console.log("groupes a charger");
        console.log(groups);
        console.log("diff");*/
        let diff = GroupUtil.leftDiff(waoType, groups, item.get("loadedGroups"));
        //console.log(diff);
        if (Object.keys(diff).length < 1) return false;
    }
    return true;
};

export const getOneByIdIfNeeded = (waoType, groups = true, id, senderKey = null) => (dispatch, getState) => {
    if (id === null) return;
    // new case
    if (+id < 0) {
        // only one new item can be created at a time, so be carefull different components don't ask it at the same time !!!!
        if (shouldFetchNew(getState(), waoType)) {
            console.log(`should fetch new ${waoType}`);
            dispatch(fetchNew(waoType, id, senderKey));
            pendingCreations[waoType] = pendingCreations[waoType] || new Map();
            pendingCreations[waoType].set(id, {groups: groups, senderKey: senderKey});
            console.log(`should fetch new ${waoType}`, pendingCreations);
        }
        else {
            setTimeout(() => {
                if (!getState().hasIn([waoType, "items", +id]) && +id >= +getState().getIn([waoType, "nextNewId"])) {
                    dispatch(createNew(waoType));
                    /*if(pendingCreations.has(`${waoType}-${id}`)){
                        const {data,groups} = pendingCreations.get(`${waoType}-${id}`);
                        setTimeout(()=>{
                            dispatch(submitLocally(waoType,data,id,groups));
                        },10);
                        pendingCreations.delete(`${waoType}-${id}`);
                    }*/
                }
            }, 5);
        }
    }
    // standard case
    else if (shouldFetchGetOneById(getState(), waoType, groups, id, senderKey)) {
        return dispatch(fetchGetOneById(waoType, groups, id, senderKey))
    }
};

const shouldFetchNew = (state, waoType) => {
    if (state.hasIn(["app", "notifications", waoType, 'DEFAULT'])) return false;
    return !state.getIn([waoType, "newItem"]);
};

export const fetchNewIfNeeded = (waoType) => (dispatch,getState) =>{
    if(!! shouldFetchNew(getState(),waoType)){
        dispatch(fetchNew(waoType,-1,null));
    }
};

export const fetchNew = (waoType, id, senderKey) => (dispatch) => {
    const url = getUrl(URL_GET_NEW, getHBProps(waoType, null, 0));
    dispatch(notify(LOADING, waoType, null));
    dispatch(notify(LOADING, senderKey, id));
    return fetch(url, getHTTPProps())
        .then(response => response.json())
        .then(json => {
                switch (json.status) {
                    case HB_SUCCESS:

                        const normData = normalize(json.data, WAOs.getIn([waoType, "schema"]));
                        //console.log('normalize receiveNew data',waoType,WAOs.getIn([waoType,"schema"]), json.data,normData);
                        Object.keys(normData.entities).forEach((key) => {
                            if (key !== waoType) {
                                dispatch(subReceiveGet(key, Object.values(normData.entities[key])));
                            }
                        });
                        dispatch(receiveNew(waoType, normData.entities[waoType][0]));
                        setTimeout(() => {
                            //console.log('pendingCreations=',pendingCreations);
                            if (!!pendingCreations[waoType]) {
                                pendingCreations[waoType].forEach(({senderKey}, id) => {
                                    dispatch(createNew(waoType));
                                    dispatch(notify(LOADING_COMPLETED, senderKey, id, HB_SUCCESS));
                                });
                            }


                            dispatch(notify(LOADING_COMPLETED, waoType, null, HB_SUCCESS));
                        }, 20);
                        /*setTimeout(()=>{
                            if(pendingCreations.has(`${waoType}-${id}`)){
                                const {data,groups} = pendingCreations.get(`${waoType}-${id}`);
                                setTimeout(()=>{
                                    dispatch(submitLocally(waoType,data,id,groups));
                                },20);
                                pendingCreations.delete(`${waoType}-${id}`);
                            }
                        },30);*/

                        break;
                    case HB_ERROR:
                        setTimeout(() => {
                            dispatch(notify(LOADING_COMPLETED, senderKey, id, HB_ERROR));
                            dispatch(notify(LOADING_COMPLETED, waoType, null, HB_ERROR));
                        }, 10);
                        dispatch(errorGet(waoType, null, 0, json.message));
                        break;
                    default:
                }
            }
        )
};


const receiveNew = (waoType, data) => ({
    type: RECEIVE_NEW,
    waoType: waoType,
    receivedAt: Date.now(),
    wao: data
});

export const createNew = (waoType) => ({
    type: CREATE_NEW,
    waoType: waoType,
    receivedAt: Date.now()
});




