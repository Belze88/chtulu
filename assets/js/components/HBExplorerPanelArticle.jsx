import React from "react";
import ProgressionCircle from "./ProgressionCircle";
import HDate from "../util/HDate";
import RImageMini from './RImageMini';
import {COLORS} from "../util/notifications";
import {connect} from "react-redux";
import {makeLocalGetByAttributeSelector} from "../selectors";

const defaultTextStyle = {
    fontFamily: "'Source Sans Pro','Helvetica Neue',Helvetica",
    fontSize  : 16,
    stroke     : "none",
    fill       : "#000000",
    fontStyle: 'normal'
};

const {floor,sqrt,log10} = Math;

const textStyle = (article,selected,hovered,linked,linksCount,minLinksCount,maxLinksCount) => {
    let overStyle = {};

    if(article && article.has("isNew") && article.get("isNew")(article)){
        overStyle.fontStyle = 'italic';
    }

    if(linked !==null && linked === false){
        overStyle.fontStyle = 'oblique';
    }

    if(selected){
        overStyle.fontWeight='bold';
        overStyle.fill=COLORS.TEXT_SELECTED;
    }
    else if(hovered){
        overStyle.fontWeight='bolder';
        overStyle.fill=COLORS.TEXT_HOVERED;
    }



    overStyle.fontSize=16 + floor(8*log10((1+linksCount - minLinksCount)));

    return Object.assign({},defaultTextStyle,overStyle);
};

const thickness = (linksCount,minLinksCount,maxLinksCount) =>{
    return 5 + floor(6*log10((1+linksCount - minLinksCount)));
};

const viewPortHeight = (linksCount,minLinksCount,maxLinksCount) =>{
    return 28 + floor(12*log10((1+linksCount - minLinksCount)));
};


const filterStyle = (article,selected,hovered) => {
    let overStyle = {floodOpacity:0};
    if(article && article.has("hasErrors") && article.get("hasErrors")(article)){
        overStyle.floodColor = COLORS.ERROR;
        overStyle.floodOpacity = 1;
    }
    else if(article && article.has("isDirty") && article.get("isDirty")(article)){
        overStyle.floodColor = COLORS.DIRTY;
        overStyle.floodOpacity = 1;
    }

    if(article && article.has("toDelete") && article.get("toDelete")){
        overStyle.floodColor = COLORS.DELETED;
        overStyle.floodOpacity = 1;
    }
    else if(article && article.has("isNew") && article.get("isNew")(article) && +article.id<0){
        overStyle.floodColor = COLORS.NEW;
        overStyle.floodOpacity = 1;
    }

    return overStyle;
};

/**
 * molecule level component defining display of one article in the panel
 */
class HBExplorerPanelArticle extends React.Component {
    constructor(props) {
        super(props);

        this.handleOnClick = this.handleOnClick.bind(this);
        this.hasAddedBox = false;
        console.log("HBExplorerPanelArticle created");
        console.log(props.article);
    }

    componentWillUnmount(){
        console.log("HBExplorerPanelArticle will unmount");
    }

    handleOnClick (e){
        const {selectArticle,article,onPanelMoveEnd} = this.props;
        e.preventDefault();
        e.stopPropagation();

        selectArticle([article.id]);
        onPanelMoveEnd(e);

    }

    render() {
        const {article,mainArticleId,minLinksCount,maxLinksCount,linksCount,linked,
            timeScale,originY,addBox,selected,hovered,setHoveredArticle,cursorDate} = this.props;

        const articleHDate = new HDate("2",
            article.beginHDate.beginDate,
            (article.endHDate && article.endHDate.endDate)||new Date());

        const currentProgression = articleHDate.getRateOfDate(cursorDate);

        const x = timeScale(article.beginHDate.beginDate);
        const endX = timeScale(article.endHDate?article.endHDate.endDate:new Date());


        const {max,min} = Math;

        const xMargin = 18;
        const viewportHeight = viewPortHeight(linksCount,minLinksCount,maxLinksCount);

        let viewportWidth = Math.max(endX-x + 2*xMargin,(article.title.length)*15);

        const y = article.currentY - originY;

        const component= this;

        let deltaX = x-xMargin < 0 ? min(-(x-xMargin),max(endX-x,1)):0;

        return (
            <svg
                key={`histo-article-svg-${article.id}`}
                id={`histo-article-svg-${article.id}`}
                viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
                width={viewportWidth}
                height={viewportHeight}
                x={x-xMargin}
                y={y}
                onMouseEnter={()=>{setHoveredArticle(article.id)}}
                onMouseLeave={()=>{setHoveredArticle()}}
                ref={node => {
                    if(node && !component.hasAddedBox){
                        addBox(node,article);
                        component.hasAddedBox = true;
                    }
                }}
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id={`article-image-${article.id}`} x={deltaX} y="0" patternUnits="userSpaceOnUse" height="30" width="30">
                        <RImageMini deltaX={0} id={article.detailImageResource} mode={'svg'}/>
                    </pattern>
                    <filter x={0} y={0} width="100%" height="100%"
                            id={`article-text-filter-${article.id}`}>
                        <feFlood {...filterStyle(article.record,selected,hovered)}/>
                        <feComposite in="SourceGraphic" operator="over"/>
                    </filter>
                </defs>
                <rect
                    fill={selected?COLORS.TEXT_SELECTED:hovered?COLORS.TEXT_HOVERED:"black"}
                    stroke={'none'}
                    x={xMargin}
                    y={7}
                    width={max(endX-x,1)}
                    height={thickness(linksCount,minLinksCount,maxLinksCount)}
                    rx={2}
                    ry={2}
                    onClick={this.handleOnClick}
                />
                <text
                    textAnchor="start"
                    filter={`url(#article-text-filter-${article.id})`}
                    x={deltaX + xMargin+15}
                    y={viewportHeight-2}
                    style={textStyle(article.record,selected,hovered,linked,linksCount,minLinksCount,maxLinksCount)}
                    onClick={this.handleOnClick}
                >
                    {article.title}
                </text>

                <circle
                    cx={deltaX + xMargin}
                    cy={15}
                    r="13"
                    fill={`url(#article-image-${article.id})`}
                    onClick={this.handleOnClick}
                />
                <ProgressionCircle
                    key={`histo-article-progcircle-${article.id}`}
                    staticRate={0}
                    rate={currentProgression}
                    cx={deltaX + xMargin}
                    cy={15}
                    r={13}/>
            </svg>
        );
    }
}

export default HBExplorerPanelArticle;
