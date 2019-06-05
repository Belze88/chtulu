import React from "react";
import HTimeRange from "../util/HTimeRange";
import { scaleTime } from "d3-scale";
import { tween, easing } from "popmotion";
import styler from "stylefire";
import posed, { PoseGroup } from "react-pose";
import date from "../util/date";
import HDate from "../util/HDate";
import TimeArrowCursor from "./TimeArrowCursor";

const styles = {
    fill: "LightBlue",
    strokeWidth: 1,
    zIndex: 10
};

const animationParams = {
    startingDuration: 800, // real ms
    exitingDuration: 400 // real ms,
};

const logFormatter = date.getFormatterFromPattern("Y");

const PosedLegend = posed.text({
    enter: {
        x: props => {
            props.x;
        },
        opacity: 1,
        delay: 0,
        duration: animationParams.startingDuration
    },
    exit: {
        x: props => {
            2 * props.x;
        },
        opacity: 0,
        delay: 0,
        duration: animationParams.exitingDuration
    }
});
const PosedLine = posed.line({
    enter: {
        x1: props => {
            props.x1;
        },
        x2: props => {
            props.x2;
        },
        opacity: 1,
        delay: 0,
        duration: animationParams.startingDuration
    },
    exit: {
        x1: props => {
            props.x1;
        },
        x2: props => {
            props.x2;
        },
        opacity: 0,
        delay: 0,
        duration: animationParams.exitingDuration
    }
});
const PosedRect = posed.rect({
    enter: {
        x: props => {
            props.x;
        },
        fillOpacity: 1,
        delay: 0,
        duration: animationParams.startingDuration
    },
    exit: {
        x: props => {
            props.x;
        },
        fillOpacity: 0,
        delay: 0,
        duration: animationParams.exitingDuration
    }
});

// proxy for grad
const Grad = (function() {
    function Grad(hTimeGrad) {
        this.hTimeGrad = hTimeGrad;
        this.toDelete = 0;
    }

    Grad.prototype = {
        getLegend() {
            return this.hTimeGrad.getLegend();
        },
        get id() {
            return this.hTimeGrad.id;
        },
        get date() {
            return this.hTimeGrad.date;
        },
        get type() {
            return this.hTimeGrad.type;
        },
        get major() {
            return this.hTimeGrad.major;
        },
        get minorAreaEndDate() {
            return this.hTimeGrad.minorAreaEndDate;
        },
        get majorAreaEndDate() {
            return this.hTimeGrad.majorAreaEndDate;
        }
    };
    return Grad;
})();

// proxy for gradRef
const GradRef = (function() {
    function GradRef(hTimeGrad) {
        this.hTimeGrad = hTimeGrad;
        this.legendRef = null;
        this.legendStyler = null;
        this.lineRef = null;
        this.lineStyler = null;
        this.minorAreaRef = null;
        this.majorAreaRef = null;
    }

    GradRef.prototype = {
        get id() {
            return this.hTimeGrad.id;
        }
    };
    return GradRef;
})();

export default class TimeArrow extends React.Component {
    constructor(props) {
        super(props);

        this.updateHInterval = this.updateHInterval.bind(this);
        this.getTimeScale = this.getTimeScale.bind(this);
        this.runAnimationIfNeeded = this.runAnimationIfNeeded.bind(this);
        this.animate = this.animate.bind(this);
        this.collectGarbage = this.collectGarbage.bind(this);

        this.gradRefs = new Map();
        this.lastIntegratedId = -1; // to speed up creation of grads from hTimeRange

        this.state = {
            hTimeRange: null,
            timeScale: null,
            grads: new Map(),
            isAnimating: false
            // gradLegends: new Map()
            //...this.getTimeRangeAndScale()
        };
    }

    componentDidMount() {
        const { hInterval, bounds } = this.props;

        const hTimeRange = new HTimeRange().setHDate(hInterval);
        const timeScale = this.getTimeScale(hInterval, bounds);

        this.animationData = {
            isAnimating: this.state.isAnimating,
            lastCurrentTime: new Date().getTime(),
            lastAnimationTime: 0,
            timeScale: timeScale
        };

        let grads = new Map(this.state.grads);
        hTimeRange.grads
            .filter(
                grad =>
                    grad.id > this.lastIntegratedId &&
                    grad.getLegend() &&
                    grad.getLegend() !== ""
            )
            .forEach(grad => {
                grads.set(grad.id, new Grad(grad));
                this.lastIntegratedId = Math.max(this.lastIntegratedId, grad.id);
            });

        this.setState({
            hTimeRange: hTimeRange,
            timeScale: timeScale,
            grads: grads
        });
    }

    updateHInterval() {
        const { hInterval, bounds } = this.props;
        let { hTimeRange } = this.state;
        const { exitingDuration } = animationParams;

        const currentTime = new Date().getTime();

        hTimeRange.setHDate(hInterval);
        const timeScale = this.getTimeScale(hInterval, bounds);

        let grads = new Map(this.state.grads);
        //console.log(this.lastIntegratedId);
        // 1 : notification de suppression des anciennes grads et suppression des grads bien supprimées
        grads.forEach((grad, id) => {
            if (grad.toDelete + exitingDuration > currentTime) {
                grads.delete(id);
            } else if (
                !hInterval.containsDate(grad.date) ||
                grad.type !== hTimeRange.type
            ) {
                grad.toDelete = currentTime;
                setTimeout(() => {
                    this.gradRefs.delete(id);
                }, exitingDuration);
            }
        });
        // creation des nouvelles grads
        hTimeRange.grads
            .filter(
                grad =>
                    grad.id > this.lastIntegratedId &&
                    grad.getLegend() &&
                    grad.getLegend() !== ""
            )
            .forEach(grad => {
                //console.log(`create grad of id ${grad.id}`);
                grads.set(+grad.id, new Grad(grad));
                this.lastIntegratedId = Math.max(this.lastIntegratedId, grad.id);
            });

        this.setState({
            hTimeRange: hTimeRange,
            timeScale: timeScale,
            grads: grads
        });
        this.runAnimationIfNeeded(timeScale);
    }

    getTimeScale(hInterval, bounds) {
        /*console.log(
          `new scaleTime ${bounds.width} - ${hInterval.beginDate} - ${
            hInterval.endDate
          }`
        );*/
        const { marginWidth } = this.props;

        return scaleTime()
            .domain([hInterval.beginDate, hInterval.endDate])
            .range([marginWidth, bounds.width - 2 * marginWidth]);
    }

    componentDidUpdate(prevProps, prevState) {
        const oldBounds = prevProps.bounds;
        const oldHInterval = prevProps.hInterval;
        const { hInterval, bounds } = this.props;

        if (oldHInterval && !hInterval.equals(oldHInterval)) {
            //console.log(1);
            this.updateHInterval();
        } else if (
            bounds.height !== oldBounds.height ||
            bounds.width !== oldBounds.width
        ) {
            //console.log(2);
            const timeScale = this.getTimeScale(hInterval, bounds);
            this.setState({ timeScale: timeScale });
            this.animationData.timeScale = timeScale;
        }
    }

    runAnimationIfNeeded(timeScale = null) {
        if (timeScale === null) timeScale = this.state.timeScale;
        const { animationPeriod, hInterval } = this.props;
        const { startingDuration, exitingDuration } = animationParams;
        const testDate = new Date();
        if (
            timeScale !== this.animationData.timeScale ||
            Math.floor(timeScale(testDate)) !==
            Math.floor(this.animationData.timeScale(testDate))
        ) {
            if (!this.state.isAnimating) this.setState({ isAnimating: true });
            setTimeout(this.runAnimationIfNeeded, animationPeriod);
            this.animate(timeScale);
        } else {
            this.animate();
            setTimeout(() => {
                if (this.props.hInterval === hInterval) {
                    this.collectGarbage();
                    this.setState({ isAnimating: false });
                }
            }, exitingDuration);
        }
    }

    animate(timeScale = null) {
        if (timeScale === null) timeScale = this.state.timeScale;
        const { animationPeriod } = this.props;
        const { exitingDuration } = animationParams;
        let {
            lastCurrentTime,
            lastCreationTime,
            lastAnimationTime
        } = this.animationData;
        let grads = new Map(this.state.grads);

        const currentTime = new Date().getTime();
        const nextTime = currentTime + animationPeriod;

        // move grads
        grads.forEach((grad, id) => {
            if (typeof this.gradRefs.get(id) !== "undefined") {
                const currentLegendX = this.gradRefs.get(id).legendStyler.get("x");
                const currentLineX = this.gradRefs.get(id).lineStyler.get("x");
                if (
                    grad.toDelete === 0 ||
                    currentTime < grad.toDelete + exitingDuration
                ) {
                    const newLegendX = timeScale(grad.date);

                    tween({
                        from: +currentLegendX,
                        to: +newLegendX,
                        duration: animationPeriod,
                        ease: easing.linear
                    }).start(this.gradRefs.get(id).legendStyler.set("x"));
                    tween({
                        from: +currentLineX,
                        to: +newLegendX,
                        duration: animationPeriod,
                        ease: easing.linear
                    }).start(this.gradRefs.get(id).lineStyler.set("x"));
                }
            }
        });
        this.animationData.timeScale = timeScale;
        //console.log(`animate ${grads.size} elements`);
    }

    collectGarbage() {
        const { exitingDuration } = animationParams;
        const currentTime = new Date().getTime();
        let deleteCounter = 0;
        this.state.grads.forEach((grad, id) => {
            if (grad.toDelete + exitingDuration > currentTime)
                deleteCounter = deleteCounter + 1;
        });

        if (deleteCounter > 0) {
            let grads = new Map(this.state.grads);
            grads.forEach((grad, id) => {
                if (grad.toDelete + exitingDuration > currentTime) grads.delete(id);
            });

            this.setState({
                grads: grads
            });
        }
    }

    render() {
        const {bounds,marginWidth,cursorRate,cursorDate,isCursorActive,setCursorRate,toggleCursor} = this.props;
        /*console.log("time arrow bounds");
        console.log(bounds.width);
        console.log(bounds.height);*/

        const width = bounds.width;
        const height = bounds.height;

        // let's design the arrow
        const stroke = 1;
        const arrowHeight = 40;
        const arrowPeekHeight = 60;
        const arrowPeekWidth = 35;

        const bottomHeight = 10;// for the cursor
        const path = `M${stroke},${(height - bottomHeight -arrowHeight) / 2} 
      L${width - stroke - arrowPeekWidth},${(height - bottomHeight - arrowHeight) / 2}
      L${width - stroke - arrowPeekWidth},${(height - bottomHeight -arrowPeekHeight) / 2}
      L${width - stroke},${(height-bottomHeight) / 2}
      L${width - stroke - arrowPeekWidth},${(height - bottomHeight + arrowPeekHeight) / 2}
      L${width - stroke - arrowPeekWidth},${(height - bottomHeight + arrowHeight) / 2}
      L${stroke},${(height - bottomHeight + arrowHeight) / 2} 
      Z`;

        let currentStyle = { ...styles };

        // let's compute time graduations : legends and then lines
        const legendHeight = 12;
        const minorGradHeight = (arrowHeight - legendHeight) * 0.45;
        const majorGradHeight = (arrowHeight - legendHeight) * 0.9;

        const { hTimeRange, timeScale, grads, isAnimating } = this.state;
        //console.log(`isAnimating : ${isAnimating}`);

        const arrayOfGradsToDisplay = Array.from(this.state.grads).filter(
            ([id, g]) => {
                return g.toDelete === 0;
            }
        );
        const gradLegends = arrayOfGradsToDisplay.map(([id, g]) => {
            const x = timeScale(g.date);
            return (
                <PosedLegend
                    key={`htime-grad-legend-${g.id}`}
                    id={`htime-grad-legend-${g.id}`}
                    opacity={0.05}
                    x={x}
                    y={height - bottomHeight/2 - (height - arrowHeight) / 2 - 2}
                    textAnchor="middle"
                    fontFamily="Verdana"
                    fontSize="10"
                    style={{ transform: "none" }}
                    ref={node => {
                        if (
                            g.toDelete === 0 &&
                            (typeof this.gradRefs.get(g.id) === "undefined" ||
                                !this.gradRefs.get(g.id).legendRef)
                        ) {
                            let newRef = null;
                            let hasMadeNewRef = false;
                            if (typeof this.gradRefs.get(g.id) === "undefined") {
                                newRef = new GradRef(g);
                                hasMadeNewRef = true;
                            } else newRef = this.gradRefs.get(g.id);

                            newRef.legendRef = node;
                            newRef.legendStyler = styler(node);
                            if (hasMadeNewRef) this.gradRefs.set(g.id, newRef);
                        }
                    }}
                >
                    {g.getLegend()}
                </PosedLegend>
            );
        });
        const gradLines = arrayOfGradsToDisplay.map(([id, g]) => {
            const x = timeScale(g.date);
            const gradHeight = g.major ? majorGradHeight : minorGradHeight;
            const y = height - bottomHeight/2 - (height - arrowHeight) / 2 - 11;
            const gradStroke = g.major ? 2 : 1;
            return (
                <PosedRect
                    key={`htime-grad-line-${g.id}`}
                    id={`htime-grad-line-${g.id}`}
                    fillOpacity={0.05}
                    x={x}
                    y={y - gradHeight}
                    height={gradHeight}
                    width={gradStroke}
                    style={{
                        transform: "none",
                        fill: "rgb(0,0,0)",
                        strokeOpacity: 0,
                        strokeWidth: 0
                    }}
                    ref={node => {
                        if (
                            g.toDelete === 0 &&
                            (typeof this.gradRefs.get(g.id) === "undefined" ||
                                !this.gradRefs.get(g.id).lineRef)
                        ) {
                            let newRef = null;
                            let hasMadeNewRef = false;
                            if (typeof this.gradRefs.get(g.id) === "undefined") {
                                newRef = new GradRef(g);
                                hasMadeNewRef = true;
                            } else newRef = this.gradRefs.get(g.id);
                            newRef.lineRef = node;
                            newRef.lineStyler = styler(node);
                            if (hasMadeNewRef) this.gradRefs.set(g.id, newRef);
                        }
                    }}
                />
            );
        });
        return (
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
            >
                <g>
                    <path
                        style={currentStyle}
                        vectorEffect="non-scaling-stroke"
                        d={path}
                        stroke="none"
                    />
                    {!isAnimating &&
                    arrayOfGradsToDisplay.map(([id, g]) => {
                        const beginX = timeScale(g.date);
                        //console.log(g.minorAreaEndDate);
                        const endX = timeScale(g.minorAreaEndDate);
                        const beginY = (height - bottomHeight - arrowHeight) / 2;
                        return (
                            <rect
                                key={`htime-grad-minor-area-${g.id}`}
                                id={`htime-grad-minor-area-${g.id}`}
                                x={beginX}
                                y={beginY}
                                width={endX - beginX}
                                height={arrowHeight}
                                style={{
                                    fill: "orange",
                                    strokeWidth: 0,
                                    fillOpacity: 0,
                                    strokeOpacity: 0,
                                    transform: "none"
                                }}
                                ref={node => {
                                    if (
                                        g.toDelete === 0 &&
                                        (typeof this.gradRefs.get(g.id) === "undefined" ||
                                            !this.gradRefs.get(g.id).minorAreaRef)
                                    ) {
                                        let newRef = null;
                                        let hasMadeNewRef = false;
                                        if (typeof this.gradRefs.get(g.id) === "undefined") {
                                            newRef = new GradRef(g);
                                            hasMadeNewRef = true;
                                        } else newRef = this.gradRefs.get(g.id);
                                        newRef.minorAreaRef = node;
                                        if (hasMadeNewRef) this.gradRefs.set(g.id, newRef);
                                    }
                                }}
                                onMouseOver={() => {
                                    this.gradRefs.get(
                                        g.id
                                    ).minorAreaRef.style.fillOpacity = 0.8;
                                }}
                                onClick={() => {
                                    this.props.setHInterval(
                                        new HDate("2", g.date, g.minorAreaEndDate)
                                    );
                                }}
                                onMouseOut={() => {
                                    this.gradRefs.get(g.id).minorAreaRef.style.fillOpacity = 0;
                                }}
                            />
                        );
                    })}
                    {!isAnimating &&
                    arrayOfGradsToDisplay
                        .filter(([id, g]) => {
                            return g.majorAreaEndDate !== null;
                        })
                        .map(([id, g]) => {
                            const beginX = timeScale(g.date);
                            //console.log(g.minorAreaEndDate);
                            const endX = timeScale(g.majorAreaEndDate);
                            const beginY = (height - bottomHeight - arrowHeight) / 2;
                            return (
                                <rect
                                    key={`htime-grad-major-area-${g.id}`}
                                    id={`htime-grad-major-area-${g.id}`}
                                    x={beginX}
                                    y={beginY}
                                    width={endX - beginX}
                                    height={arrowHeight / 2 - 4}
                                    style={{
                                        fill: "orange",
                                        strokeWidth: 0,
                                        fillOpacity: 0,
                                        strokeOpacity: 0,
                                        transform: "none"
                                    }}
                                    ref={node => {
                                        if (
                                            g.toDelete === 0 &&
                                            (typeof this.gradRefs.get(g.id) === "undefined" ||
                                                !this.gradRefs.get(g.id).majorAreaRef)
                                        ) {
                                            let newRef = null;
                                            let hasMadeNewRef = false;
                                            if (typeof this.gradRefs.get(g.id) === "undefined") {
                                                newRef = new GradRef(g);
                                                hasMadeNewRef = true;
                                            } else newRef = this.gradRefs.get(g.id);
                                            newRef.majorAreaRef = node;
                                            if (hasMadeNewRef) this.gradRefs.set(g.id, newRef);
                                        }
                                    }}
                                    onMouseOver={() => {
                                        this.gradRefs.get(
                                            g.id
                                        ).majorAreaRef.style.fillOpacity = 0.8;
                                    }}
                                    onClick={() => {
                                        this.props.setHInterval(
                                            new HDate("2", g.date, g.majorAreaEndDate)
                                        );
                                    }}
                                    onMouseOut={() => {
                                        this.gradRefs.get(
                                            g.id
                                        ).majorAreaRef.style.fillOpacity = 0;
                                    }}
                                />
                            );
                        })}
                    <PoseGroup>{gradLines}</PoseGroup>
                    <PoseGroup>{gradLegends}</PoseGroup>
                </g>
                <TimeArrowCursor
                    key={'time-arrow-cursor'}
                    cursorDate = {cursorDate}
                    cursorRate = {cursorRate}
                    isCursorActive={isCursorActive}
                    setCursorRate={setCursorRate}
                    toggleCursor={toggleCursor}
                    width = {width}
                    height = {height}
                    marginWidth = {marginWidth}
                />
            </svg>
        );
    }
}