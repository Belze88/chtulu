import React from "react";
import ReactDOM from "react-dom";
//import { distance, vectorDiff, LEFT, RIGHT, VERTICAL } from "../util/geometry";

import { connect } from "react-redux";
import debounce from "debounce";
import { Button, Glyphicon, Form } from "react-bootstrap";
import HBExplorerDateInput from "./HBExplorerDateInput";

import MeasureAndRender from "./MeasureAndRender";
import TimeArrow from "./TimeArrow.jsx";
import HBExplorerTimePanel from "./HBExplorerTimePanel.jsx";
import MapContainer from "./MapContainer.jsx";
import MapHandlerIcon from "./MapHandlerIcon.jsx";
import CSSVariableApplicator from "./CSSVariableApplicator.jsx";

import HDate from "../util/HDate";
import dU from "../util/date";

import { tween, easing } from "popmotion";
import styler from "stylefire";
import cmn from "../util/common";
import styled, { ThemeProvider } from "styled-components";
import ResizeBar from "./ResizeBar";
import HBExplorerHeader from "./HBExplorerHeader";
import {
    splitCssLength,
    getInlinedCss,
    cssizePropertyName,
    AVAILABLE_THEMES
} from "../util/cssUtil";
const { EDITOR, SIDEVIEW, VERTICAL } = AVAILABLE_THEMES;

const explorerUid = require("uuid/v4")();

let _idGenerator = cmn.getIdGenerator();

const Container = styled.div`
  ${({ theme: { container } }) => getInlinedCss(container)}
`;
const Header = styled.div`
  ${({ theme: { header } }) => getInlinedCss(header)}
`;
const Middle = styled.div`
  ${({ theme: { middle } }) => getInlinedCss(middle)}
`;
const Left = styled.div`
  ${({ theme: { left } }) => getInlinedCss(left)}
`;
const Right = styled.div`
  ${({ theme: { right } }) => getInlinedCss(right)}
`;
const Bottom = styled.div`
  ${({ theme: { bottom } }) => getInlinedCss(bottom)}
`;

const TimeArea = styled.div`
  ${({ theme: { timeArea } }) => getInlinedCss(timeArea)}
`;
const TimePanel = styled.div`
  ${({ theme: { timePanel } }) => getInlinedCss(timePanel)}
`;
const TimeFooter = styled.div`
  ${({ theme: { timeFooter } }) => getInlinedCss(timeFooter)}
`;
const MapArea = styled.div`
  ${({ theme: { mapArea } }) => getInlinedCss(mapArea)}
`;
const ContentArea = styled.div`
  ${({ theme: { contentArea } }) => getInlinedCss(contentArea)}
`;

const DEFAULT_LAYOUT = {
    container: {
        display: `flex`,
        flexDirection: "column",
        overflow: `hidden`,
        border: `1px solid black`,
        borderRadius: "3px",
        padding: "5px"
    },
    header: {
        order: 1,
        overflow: `hidden`,
        height: `40px`,
        background: `#AA0`,
        border: `2px solid rgb(23, 88, 190)`,
        padding: `0px`
    },
    middle: {
        order: 3,
        background: `#A00`,
        overflow: `hidden`,
        display: "flex",
        flexDirection: "row"
    },
    left: {
        order: 1,
        background: `#B00`
    },
    right: {
        order: 2,
        background: "blue"
    },
    bottom: {
        order: 5,
        overflow: `hidden`,
        height: `20%`,
        border: `2px solid rgb(23, 88, 190)`
    },
    timeArea: {
        padding: "0px",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },
    timePanel: {
        order: 1,
        height: `100%`,
        background: `#C0C`
    },
    timeFooter: {
        order: 2,
        height: `40px`,
        background: `#D00`
    },
    mapArea: {
        padding: "0px",
        height: "100%",
        width: "100%",
        display: "flex",
        background: "green",
        flexDirection: "column"
    },
    contentArea: {
        padding: "0px",
        height: "100%",
        width: "100%",
        background: `#AAB`
    }
};

let VERTICAL_LAYOUT = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
VERTICAL_LAYOUT.middle.flexDirection = "column";
VERTICAL_LAYOUT.left.order = 3;

const THEMES = {
    EDITOR: DEFAULT_LAYOUT,
    SIDEVIEW: DEFAULT_LAYOUT,
    VERTICAL: VERTICAL_LAYOUT
};

let { context, provider } = React.createContext();

class HBExplorer extends React.Component {
    constructor(props) {
        super(props);

        this.containerRef = React.createRef();
        this.headerRef = React.createRef();
        this.middleRef = React.createRef();
        this.bottomRef = React.createRef();
        this.rightRef = React.createRef();
        this.setTheme = this.setTheme.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onBottomResize = this.onBottomResize.bind(this);
        this.onRightResize = this.onRightResize.bind(this);

        this.state = {
            guiInitialized: 0,
            frameSizes: new Map()
                .set("container.width", `400px`)
                .set("container.height", `400px`)
                .set("middle.height", `80%`)
                .set("bottom.height", `20%`)
                .set("left.width", `70%`)
                .set("right.width", `30%`),
            currentTheme: VERTICAL
        };
        console.log("build");
    }

    componentDidMount() {
        window.addEventListener("resize", this.onWindowResize);
        this.onWindowResize();
        this.setState({ guiInitialized: 1 });
        setTimeout(() => {
            console.log("gui2");
            this.setState({ guiInitialized: 2 });
        }, 100);
    }

    setTheme(theme) {
        console.log(theme);
        this.setState({ currentTheme: theme, guiInitialized: 1 });
        setTimeout(() => {
            this.setState({ guiInitialized: 2 });
        }, 20);
    }

    onWindowResize() {
        const {
            containerRef: { current }
        } = this;
        const { frameSizes } = this.state;
        if (!current || current === null) return;

        const containerRect = this.containerRef.current.getBoundingClientRect();
        console.log(
            `resized window : ${window.innerWidth} / ${window.innerHeight}`
        );
        console.log(
            `explorer origin : ${containerRect.top} / ${containerRect.left}`
        );
        console.log(
            `resized explorer : ${containerRect.width} / ${containerRect.height}`
        );

        const newContainerWidth = window.innerWidth - containerRect.left;
        const newContainerHeight = window.innerHeight - containerRect.top;

        if (
            `${newContainerWidth}px` !== frameSizes.get("container.width") ||
            `${newContainerHeight}px` !== frameSizes.get("container.height")
        ) {
            let newFrameSizes = new Map(frameSizes);
            newFrameSizes
                .set("container.width", `${newContainerWidth}px`)
                .set("container.height", `${newContainerHeight}px`);

            this.setState({ frameSizes: newFrameSizes });
        }
    }

    // begin flag :set the scale and origin values for resize
    onBottomResize(delta, flag = "onGoing") {
        const { frameSizes } = this.state;
        if (flag === "begin") {
            this.onBottomResizeParam = {
                beginMousePosition: delta,
                rangeAbsoluteSize:
                this.containerRef.current.getBoundingClientRect().height -
                this.headerRef.current.getBoundingClientRect().height,
                beginRelativeSize: frameSizes.get("bottom.height")
            };
            return;
        }
        // onGoing
        const { min, max } = Math;
        const { rangeAbsoluteSize, beginRelativeSize } = this.onBottomResizeParam;
        console.log(`bottom resize ${delta}px vs ${rangeAbsoluteSize}px`);
        let { length, unit } = splitCssLength(beginRelativeSize);

        let newPercentage = +length - (100 * delta) / rangeAbsoluteSize;
        newPercentage = max(min(newPercentage, 100), 0);

        let newFrameSizes = new Map(this.state.frameSizes);
        newFrameSizes
            .set("bottom.height", `${newPercentage}%`)
            .set("middle.height", `${100 - newPercentage}%`);
        this.setState({ frameSizes: newFrameSizes });

        console.log(newPercentage);
    }

    // begin flag :set the scale and origin values for resize
    onRightResize(delta, flag = "onGoing") {
        const { frameSizes, currentTheme } = this.state;
        if (flag === "begin") {
            this.onRightResizeParam = {
                beginMousePosition: delta,
                rangeAbsoluteSize:
                    currentTheme === "VERTICAL"
                        ? this.middleRef.current.getBoundingClientRect().height
                        : this.middleRef.current.getBoundingClientRect().width,
                beginRelativeSize: frameSizes.get("right.width")
            };
            return;
        }
        // onGoing
        const { min, max } = Math;
        const { rangeAbsoluteSize, beginRelativeSize } = this.onRightResizeParam;

        console.log(`right resize ${delta}px vs ${rangeAbsoluteSize}px`);

        let { length, unit } = splitCssLength(beginRelativeSize);

        let newPercentage =
            +length +
            ((currentTheme === "VERTICAL" ? 1 : -1) * (100 * delta)) /
            rangeAbsoluteSize;
        newPercentage = max(min(newPercentage, 100), 0);

        let newFrameSizes = new Map(this.state.frameSizes);
        newFrameSizes
            .set("right.width", `${newPercentage}%`)
            .set("left.width", `${100 - newPercentage}%`);
        this.setState({ frameSizes: newFrameSizes });

        console.log(newPercentage);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize);
    }

    render() {
        const { currentTheme, frameSizes, guiInitialized } = this.state;
        const theme = THEMES[currentTheme];
        console.log(currentTheme);

        const timeArea = (
            <TimeArea>
                <TimePanel>
                    <MeasureAndRender
                        stretch={true}
                        debounce={1}
                        onWindowResize={this.onPanelAreaResize}
                        updaterVar={frameSizes.get("contentArea.height")+
                        frameSizes.get("panelArea.height")+frameSizes.get("explorer.width")}
                        /*ref={node => {
                            this.panelMeasureRef = node;
                        }}*/
                    >
                        {bounds => {
                            //console.log("test2");
                            const stroke = 1;
                            //{ stroke, className, bounds} = props;
                            const path = `M${stroke},${stroke}
      L${bounds.width - stroke},${stroke}
      L${bounds.width - stroke},${bounds.height - 10 - stroke}
      L${stroke},${bounds.height - 10 - stroke}
      Z`;
                            //console.log(path);

                            return [
                                <HBExplorerTimePanel
                                    key={"hg-time-panel"}
                                    bounds={bounds}
                                    path={path}
                                    articles={articles}
                                    selectArticle={this.selectArticle}
                                    selected={selected}
                                    //addArticle={this.addArticle}
                                    setInvisibles={this.setInvisibles}
                                    hInterval={hInterval}
                                    setHInterval={this.setHInterval}
                                    animationPeriod={this.timeTravellingPeriod}
                                    marginWidth={10}
                                    cursorRate={cursorRate}
                                    cursorDate = {cursorDate}
                                    isCursorActive={isCursorActive}
                                />
                            ];
                        }}
                    </MeasureAndRender>


                </TimePanel>
                <TimeFooter>footer</TimeFooter>
            </TimeArea>
        );

        const mapArea = <MapArea>map</MapArea>;

        const contentArea = <ContentArea>content</ContentArea>;

        return (
            <ThemeProvider theme={theme}>
                <div ref={this.containerRef} style={{ padding: "0px" }}>
                    {guiInitialized > 0 && (
                        <Container
                            key={`container`}
                            style={{
                                width: frameSizes.get("container.width"),
                                height: frameSizes.get("container.height")
                            }}
                            ref={this.containerRef}
                        >
                            <Header ref={this.headerRef}>
                                <HBExplorerHeader
                                    theme={this.state.currentTheme}
                                    onChange={this.setTheme}
                                />
                            </Header>
                            <Middle
                                ref={this.middleRef}
                                style={{
                                    height: frameSizes.get("middle.height")
                                }}
                            >
                                <Left
                                    style={{
                                        height: [VERTICAL].includes(currentTheme)
                                            ? frameSizes.get("left.width")
                                            : null,
                                        width: [EDITOR, SIDEVIEW].includes(currentTheme)
                                            ? frameSizes.get("left.width")
                                            : null
                                    }}
                                >
                                    {[EDITOR, VERTICAL].includes(currentTheme)
                                        ? timeArea
                                        : contentArea}
                                </Left>
                                {guiInitialized > 1 && !!this.rightRef.current && (
                                    <ResizeBar
                                        key={`right-resize-bar-${currentTheme}`}
                                        placementType={
                                            [EDITOR, SIDEVIEW].includes(currentTheme)
                                                ? "right"
                                                : "bottom"
                                        }
                                        style={
                                            [EDITOR, SIDEVIEW].includes(currentTheme)
                                                ? {
                                                    height: this.rightRef.current.getBoundingClientRect()
                                                        .height,
                                                    top: this.rightRef.current.getBoundingClientRect()
                                                        .top,
                                                    right:
                                                    window.innerWidth -
                                                    this.rightRef.current.getBoundingClientRect().left
                                                }
                                                : {
                                                    bottom:
                                                    window.innerHeight -
                                                    this.rightRef.current.getBoundingClientRect()
                                                        .top -
                                                    this.rightRef.current.getBoundingClientRect()
                                                        .height,
                                                    width: this.rightRef.current.getBoundingClientRect()
                                                        .width,
                                                    left: this.rightRef.current.getBoundingClientRect()
                                                        .left
                                                }
                                        }
                                        onMove={this.onRightResize}
                                    />
                                )}
                                <Right
                                    ref={this.rightRef}
                                    style={{
                                        height: [VERTICAL].includes(currentTheme)
                                            ? frameSizes.get("right.width")
                                            : null,
                                        width: [EDITOR, SIDEVIEW].includes(currentTheme)
                                            ? frameSizes.get("right.width")
                                            : null
                                    }}
                                >
                                    {mapArea}
                                </Right>
                            </Middle>
                            {guiInitialized > 1 && !!this.bottomRef.current && (
                                <ResizeBar
                                    key={"bottom-resize-bar"}
                                    placementType={"bottom"}
                                    style={{
                                        bottom:
                                        window.innerHeight -
                                        this.bottomRef.current.getBoundingClientRect().top,
                                        width: this.bottomRef.current.getBoundingClientRect().width,
                                        left: this.bottomRef.current.getBoundingClientRect().left
                                    }}
                                    onMove={this.onBottomResize}
                                />
                            )}
                            <Bottom
                                ref={this.bottomRef}
                                key={`bottom`}
                                style={{
                                    height: frameSizes.get("bottom.height")
                                }}
                            >
                                {[EDITOR, VERTICAL].includes(currentTheme)
                                    ? contentArea
                                    : timeArea}
                            </Bottom>
                        </Container>
                    )}
                </div>
            </ThemeProvider>
        );
    }
}

export default HBExplorer;
