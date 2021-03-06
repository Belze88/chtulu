import React,{ Component } from "react";
import {getArticlesHistory} from "../selectors";
import { connect } from 'react-redux';
import SidebarHistoryArticle from './SidebarHistoryArticle';
import {withRouter} from 'react-router-dom';

class SidebarHistory extends Component {
    constructor(props) {
        super(props);
        this.onWindowResize = this.onWindowResize.bind(this);

        this.state = {
            height:100,
        };
    }

    componentDidMount() {
        window.addEventListener("resize", this.onWindowResize);
        this.onWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize);
    }

    onWindowResize() {
        //console.log(`resized window : ${window.innerWidth} / ${window.innerHeight}`);
        this.setState({height:Math.floor(window.innerHeight-300)});
    }

    render(){
        //console.log('sidebar history props',this.props);
        const {height} = this.state;
        const historyIds = this.props.getHistory();
        const sidebarHistoryArticles = historyIds.map((id)=>(
            <SidebarHistoryArticle key={id} id={id} sidebarStatus={this.props.sidebarStatus} history={this.props.history}/>
        ));

        return (
            <ul
                className="sidebar-menu" data-widget="tree"
                style={{
                    maxHeight:`${height}px`,
                    overflowY:"auto",
                    borderBottom: `3px ridge rgb(170, 50, 220, .4)`
                }}
            >
                {sidebarHistoryArticles}
            </ul>
        );
    }
}

const mapStateToProps = state => {
        return {
            getHistory: getArticlesHistory(state)
        }
};

export default withRouter(connect(mapStateToProps)(SidebarHistory));