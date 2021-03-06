import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter,Route,Switch,useHistory} from 'react-router-dom';
import Header from "./organisms/Header";
import SideBar from "../shared/organisms/SideBar";

import {
    makeGetPendingTotalSelector, makeGetNotificationsSelector,
} from "../shared/selectors";
import {postAll,resetAll} from "./actions";
import {COLORS, SUBMITTING, SUBMITTING_COMPLETED} from "../util/notifications";
import Loadable from 'react-loading-overlay';
import MainNotification from './atoms/MainNotification';
import AppContext from "../util/AppContext";
import {loadInitialHResponse} from "./actions";

import WelcomePage from "./pages/WelcomePage";
import ArticlePage from "./pages/ArticlePage";
import AccountPage from "./pages/AccountPage";
import UserPublicPage from "../shared/pages/UserPublicPage";
import ArticleTablePage from "./pages/ArticleTablePage";
import ContactPage from "./pages/ContactPage";
import PopEditionPage from "./pages/PopEditionPage";



const routes = [
    {
        id:1,
        path:'/welcome',
        exact:true,
        component:WelcomePage
    },
    {
        id:2,
        path:'/welcome?:search',
        exact:true,
        component:WelcomePage
    },
    {
        id:4,
        path:'/article/:id',
        exact:true,
        component:ArticlePage
    },
    {
        id:5,
        path:'/article/:id/:actionParam',
        exact:true,
        component:ArticlePage
    },
    {
        id:6,
        path:'/account',
        exact:true,
        component:AccountPage
    },
    {
        id:7,
        path:'/account/:nav',
        exact:true,
        component:AccountPage
    },
    {
        id:8,
        path:'/user/:id',
        exact:true,
        component:UserPublicPage
    },
    {
        id:10,
        path:'/article-table',
        exact:true,
        component:ArticleTablePage
    }
    ,
    {
        id:11,
        path:'/contact',
        exact:true,
        component:ContactPage
    },
    {
        id:12,
        path:'/pop-edition',
        exact:true,
        component:PopEditionPage
    }
];



class Auth extends Component {
    constructor(props) {
        super(props);
        this.onArticleSelect = this.onArticleSelect.bind(this);
        this.onPostAll = this.onPostAll.bind(this);
        this.onResetAll = this.onResetAll.bind(this);

        this.state={
            headerHeight:0,
            sidebarWidth:0
        }
    }


    componentDidMount()
    {
        const {dispatch,getNotifications} = this.props;
        dispatch(loadInitialHResponse("DEFAULT"));
        //window.addEventListener("hb.article.select", this.onArticleSelect);
    }

    componentWillUnmount()
    {
        //window.removeEventListener("hb.article.select", this.onArticleSelect);
    }

    onArticleSelect(e){
        /*const history = useHistory();
        history.push(`/article/${e.articleId}`);*/
    }

    onPostAll(){
        const {dispatch,getNotifications} = this.props;
        const notifications = getNotifications('HBAPP');
        const submitting = (notifications && notifications.hasIn(['DEFAULT',SUBMITTING]))||false;
        if(!submitting) dispatch(postAll());
    }

    onResetAll(){
        const {dispatch,getNotifications} = this.props;
        const notifications = getNotifications('HBAPP');
        const submitting = (notifications && notifications.hasIn(['DEFAULT',SUBMITTING]))||false;
        if(!submitting) dispatch(resetAll());
    }


    render(){
        const {getNotifications,getPendingTotal} = this.props;
        let appProps = this.props;
        //console.log(appProps);

        let pendingTotal = getPendingTotal();

        const notifications = getNotifications('HBAPP');
        /*console.log("HBAPP notifications");
        console.log(notifications);*/
        const submitting = (notifications && notifications.hasIn(['DEFAULT',SUBMITTING]))||false;

        let submittingCompleted = (notifications && notifications.
        getIn(['DEFAULT',SUBMITTING_COMPLETED]))||null;
        submittingCompleted = (submittingCompleted && !submittingCompleted.get("discardedAt"))?submittingCompleted:null;

        const mainNotification = React.createElement(MainNotification);

        return (
            <AppContext.Provider key={`app-provider`} value={{...this.state}}>
                <BrowserRouter {...appProps} basename="/app/">
                    {/*<Loadable*/}
                    {/*active={submitting}*/}
                    {/*spinner*/}
                    {/*text={"Enregistrement de vos données ..."}*/}
                    {/*color={COLORS.SUBMITTING}*/}
                    {/*background={COLORS.LOADING_BACKGROUND}*/}
                    {/*>*/}
                    <div className="wrapper hold-transition skin-blue sidebar-mini">
                        <Loadable
                            active={submitting}
                            spinner
                            text={"Enregistrement de vos données ..."}
                            color={COLORS.SUBMITTING}
                            background={COLORS.LOADING_BACKGROUND}
                        >
                            <Header
                                {...appProps}
                                pendingData={pendingTotal>0}
                                onPostAll={this.onPostAll}
                                onResetAll={this.onResetAll}
                            />
                            <AppContext.Provider key={`app-provider`} value={{...this.state}}>
                                {routes.map(({id,path,exact,component:C}) =>
                                    <Route
                                        key={id}
                                        exact={exact}
                                        path={path}
                                        render={(props) =>
                                            <div>
                                            <SideBar {...this.props} {...props}/>
                                            <C {...this.props} {...props}/>
                                        </div>}

                                    />
                                )}
                            </AppContext.Provider>
                        </Loadable>
                    </div>

                    {/*</Loadable>*/}
                </BrowserRouter>
            </AppContext.Provider>
        );
    }
}

const makeMapStateToProps = () => {
    const getPendingTotalSelector = makeGetPendingTotalSelector();
    const getNotificationsSelector = makeGetNotificationsSelector();

    return state => {
        return {
            getPendingTotal: getPendingTotalSelector(state.get("app")),
            getNotifications: getNotificationsSelector(state.get("app"))
        }
    }
};

export default connect(makeMapStateToProps)(Auth)
