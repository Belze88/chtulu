import React from 'react';
import {connect} from "react-redux";
import {Helmet} from 'react-helmet';
import HBExplorerProxy from "../organisms/HBExplorerProxy.jsx";
import {makeGetOneByIdSelector} from "../../shared/selectors";
import {getOneByIdIfNeeded} from '../../shared/actions';
import {notifyArticleSelection} from '../../shared/actions';

const getActiveComponent = actionParam =>(actionParam==='edit'?'form':'detail');

export class ArticlePage extends React.Component {
    constructor(props) {
        super(props);

        /*console.log(props);
        console.log(props.match.params.id);*/

        const {id,actionParam} = props.match.params;

        this.state = {
            id: +props.id||+id,
            activeComponent:props.activeComponent||getActiveComponent(actionParam),
            /*detailGroups:props.detailGroups || {"minimal":true,"abstract":true,"date":true,
                "detailImage":{"activeVersion":true}
            },
            formGroups:props.formGroups || {"minimal":true,"abstract":true,"date":true,"detailImage":true},*/
            //pendingData: (props.data)?Object.create(props.data):null,
        };
    }

    componentDidMount(){
        const {dispatch,nextNewIdSelector} = this.props;
        /*if(!this.state.id){
            this.setState({id:nextNewIdSelector(),activeComponent:'form'})
        }*/
        if(!!this.state.id){
            dispatch(getOneByIdIfNeeded("article",
                {
                    minimal:true,
                    date:true,
                    detailImage:{minimal:true,urlMini:true},
                    abstract:true,
                    geometry:true,
                    owner:{minimal:true}
                },
                this.state.id));

            dispatch(notifyArticleSelection(+this.state.id));
        }
    }

    componentDidUpdate(prevProps) {
        /*console.log('article page props');
        console.log(this.props);*/

        const id = +this.props.id||+this.props.match.params.id;
        const activeComponent = this.props.activeComponent||getActiveComponent(this.props.match.params);
        /*console.log(id);
        console.log(activeComponent);*/

        const oldId = +this.state.id;
        const oldActiveComponent = this.state.activeComponent;

        if (id !== oldId) {
            this.setState({id:+id});
            this.props.dispatch(notifyArticleSelection(+id));
        }
        if (activeComponent !== oldActiveComponent) {
            this.setState({activeComponent:activeComponent});
        }
    }

    render(){
        const {id,activeComponent} = this.state;
        const {getOneById} = this.props;
        const article = getOneById(id);

        const articleTitle = (article && article.get("title")) || 'Nouvel article';
        //console.log(+id);

        return (
            <div className="content-wrapper hb-container">
                <Helmet>
                    <title>{articleTitle}</title>
                </Helmet>
                {/*<section className="content-header">*/}
                    {/*<h4><ArticleTitle id={+id}/></h4>*/}
                {/*</section>*/}
                <section className="content no-padding">
                    <div>
                        <HBExplorerProxy
                            mainArticleId={+id}
                        />
                    </div>
                </section>
            </div>
        )
    }
}

const makeMapStateToProps = () => {
    const getOneByIdSelector = makeGetOneByIdSelector();
    return state => {
        const dataSubState = state.get("article");

        return {
            getOneById : getOneByIdSelector(dataSubState),
            //nextNewIdSelector : getNextNewIdSelector(dataSubState)

        }
    }
};

export default connect(makeMapStateToProps)(ArticlePage);