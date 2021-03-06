import {
    DataToPost,
    getHBProps,
    getHTTPProps,
    getUrl,
    HB_CONFIRM,
    HB_ERROR,
    HB_INFO,
    HB_SUCCESS,
    HB_WARNING,
    HTTP_POST,
    INITIAL_HRESPONSE,
    URL_ASK_PASSWORD_RECOVERY,
    URL_GET_ONE_BY_ID,
    URL_LOGIN,
    URL_REGISTER
} from '../util/server';
import {normalize} from 'normalizr';
import WAOs from '../util/WAOs';
import GroupUtil from "../util/GroupUtil";
import {INITIAL, LOADING, LOADING_COMPLETED, SUBMITTING, SUBMITTING_COMPLETED} from '../util/notifications';
import {discard, errorGet, notify, subReceiveGet} from '../shared/actions';

// data reception actions
export const GET_ONE_BY_ID = 'GET_ONE_BY_ID';
export const RECEIVE_GET_ONE_BY_ID = 'RECEIVE_GET_ONE_BY_ID';

// MAP to hold the various get called made and prevent double calls
const pendingAPICalls = new Map();



export const regularRegister = (data,senderKey) => (dispatch, getState) => {
    console.log("register");
    console.log(data);

    let dataToPost = DataToPost(senderKey);
    dataToPost.email = data.email;
    dataToPost.password = data.password;
    console.log(`dataToPost`);
    console.log(dataToPost);

    const url = getUrl(URL_REGISTER);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    dispatch(notify(SUBMITTING,senderKey,0));

    return fetch(url,httpProps)
        .then(response => response.json())
        .catch(exception => {
                dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,null,"Le serveur est tombé en erreur :(",null));
            }
        )
        .then(json => {
                console.log("post returned !");
                console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_SUCCESS,json.data,json.message));
                        break;
                    case HB_ERROR:
                        console.error(json.message);
                        console.log(json.errors);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,json.data,json.message,json.errors));
                        break;
                    case HB_WARNING:
                        console.warn(json.message);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_WARNING,json.data,json.message,json.errors));
                        break;
                    default:
                }
            }
        )
};

export const regularLogin = (data,senderKey) => (dispatch, getState) => {
    console.log("login");
    console.log(data);

    let dataToPost = DataToPost(senderKey);
    dataToPost.login = data.login;
    dataToPost.password = data.password;
    console.log(`dataToPost`);
    console.log(dataToPost);

    const url = getUrl(URL_LOGIN);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    dispatch(notify(SUBMITTING,senderKey,0));

    return fetch(url,httpProps)
        .then(response => response.json())
        .catch(exception => {
                dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,null,"Le serveur est tombé en erreur :(",null));
            }
        )
        .then(json => {
                console.log("post returned !");
                console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_SUCCESS,json.data,json.message));
                        break;
                    case HB_ERROR:
                        console.error(json.message);
                        console.log(json.errors);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,json.data,json.message,json.errors));
                        break;
                    case HB_WARNING:
                        console.warn(json.message);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_WARNING,json.data,json.message,json.errors));
                        break;
                    default:
                }
            }
        )
};

export const askPasswordRecovery = (data,senderKey) => (dispatch, getState) => {
    console.log("askPasswordRecovery");
    console.log(data);

    let dataToPost = DataToPost(senderKey);
    dataToPost.login = data.login;
    console.log(`dataToPost`);
    console.log(dataToPost);

    const url = getUrl(URL_ASK_PASSWORD_RECOVERY);
    let httpProps = getHTTPProps(HTTP_POST);
    httpProps.body = JSON.stringify(dataToPost);

    dispatch(notify(SUBMITTING,senderKey,0));

    return fetch(url,httpProps)
        .then(response => response.json())
        .catch(exception => {
                dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,null,"Le serveur est tombé en erreur :(",null));
            }
        )
        .then(json => {
                console.log("post returned !");
                console.log(json);
                switch (json.status) {
                    case HB_SUCCESS:
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_SUCCESS,json.data,json.message));
                        break;
                    case HB_ERROR:
                        console.error(json.message);
                        console.log(json.errors);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_ERROR,json.data,json.message,json.errors));
                        break;
                    case HB_WARNING:
                        console.warn(json.message);
                        dispatch(notify(SUBMITTING_COMPLETED,senderKey,0,HB_WARNING,json.data,json.message,json.errors));
                        break;
                    default:
                }
            }
        )
};




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

const APICallKey = (callType,waoType,groups=true,id=null,searchBag=null) =>{
    switch (callType){
        case 'getOneById' :
            return `${waoType}_${id}_${JSON.stringify(groups)}`;
            break;
        default :
            return 'NA';
            break;
    }
};

const fetchGetOneById = (waoType,groups=true,id,senderKey) => (dispatch,state) => {
    pendingAPICalls.set(APICallKey('getOneById',waoType,groups,id),new Date());
    dispatch(notify(LOADING,senderKey,id));
    const url = getUrl(URL_GET_ONE_BY_ID,getHBProps(waoType,groups,id));

    return fetch(url,getHTTPProps())
        .then(response => response.json())
        .then(json => {
                pendingAPICalls.delete(APICallKey('getOneById',waoType,groups,id));
                switch (json.status) {
                    case HB_SUCCESS:
                        console.info(json);
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
    if(pendingAPICalls.has(APICallKey('getOneById',waoType,groups,id))) return false;
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
        //console.log(diff);
        if(Object.keys(diff).length < 1) return false;
    }
    return true;
};

export const getOneByIdIfNeeded = (waoType,groups=true,id,senderKey=null) => (dispatch, getState) => {
    if (id===null) return;
    if (shouldFetchGetOneById(getState(), waoType,groups,id,senderKey)) {
        return dispatch(fetchGetOneById(waoType, groups, id, senderKey))
    }
};


let hasLoadedInitialHResponse = false;
export const loadInitialHResponse = (senderKey=null) => (dispatch, getState) => {
    if(hasLoadedInitialHResponse) return;
    hasLoadedInitialHResponse = true;
    if(INITIAL_HRESPONSE === null) return;
    const json = INITIAL_HRESPONSE;
    console.log(`initialHResponse`);
    console.log(json);

    switch (json.status) {
        case HB_SUCCESS:
            console.log(`notify initialHResponse`);
            return dispatch(notify(INITIAL,senderKey,0,HB_SUCCESS,json.data,json.message));
            break;
        case HB_INFO:
            console.log(`notify initialHResponse`);
            return dispatch(notify(INITIAL,senderKey,0,HB_INFO,json.data,json.message));
            break;
        case HB_ERROR:
            console.error(json.message);
            console.log(json.errors);
            return dispatch(notify(INITIAL,senderKey,0,HB_ERROR,json.data,json.message,json.errors));
            break;
        case HB_WARNING:
            console.warn(json.message);
            return dispatch(notify(INITIAL,senderKey,0,HB_WARNING,json.data,json.message,json.errors));
            break;
        case HB_CONFIRM:
            setTimeout(()=>{dispatch(discard(INITIAL,senderKey,0))},1000);
            return dispatch(notify(INITIAL,senderKey,0,HB_CONFIRM,json.data,json.message,json.errors));
            break;
        default:
    }
};
