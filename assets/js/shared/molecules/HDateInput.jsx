import React, { Component } from "react";
import {
    ControlLabel,
    FormGroup,
    FormControl,
    Overlay,
    OverlayTrigger,
    Popover,
    Col,
    HelpBlock
} from "react-bootstrap";
import HDatePicker from "../organisms/HDatePicker";
import {defaultInputStyles} from "../../util/cssUtil";
const componentUid = require('uuid/v4')();

const windowPadding=15;

let defaultStyles = {
    horizontal: Object.assign({
        //position: "relative",
        fontSize: "14px"
    },{...defaultInputStyles.horizontal}),
    vertical: Object.assign({
        //position: "relative",
        fontSize: "14px"
    },{...defaultInputStyles.vertical})
};



class HDateInput extends Component {
    constructor(props) {
        super(props);

        this.handleSave = this.handleSave.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.inputRef = null;
        this.state = {
            show:false,
            value: "",
            pickerStyle:{}
        };

        this.targetLol = React.createRef();
    }

    handleFocus(){
        this.setState({show:true});

        setTimeout(()=>{
            const existingElement = document.getElementById('reactbs-overlayed-date-picker');
            console.log("toggle show hDatePicker",existingElement);

            if(! existingElement) return;

            const style={marginLeft:0,marginTop:0};
            if(existingElement.style){
                style.marginLeft = +existingElement.style.marginLeft.replace('px','');
                style.marginTop = +existingElement.style.marginTop.replace('px','');
            }
            //console.log('style',style);

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const bounds = existingElement.getBoundingClientRect();
            console.log('widget bounding Rect',bounds,windowWidth);

            if(bounds.right + windowPadding > windowWidth){
                style.marginLeft+=windowWidth-(bounds.right + windowPadding);
            }
            else{
                style.marginLeft+=Math.min(-style.marginLeft,windowWidth-(bounds.right + windowPadding));
            }
            if(bounds.bottom + windowPadding > windowHeight){
                style.marginTop+=windowHeight-(bounds.bottom + windowPadding);
            }
            else{
                style.marginTop+=Math.min(-style.marginTop,windowHeight-(bounds.bottom + windowPadding));
            }

            console.log("hDatePicker ",style);

            this.setState({pickerStyle:style});
        },20);


    }

    handleBlur(){
        this.setState({show:true});
    }

    handleClose() {
        this.setState({show:false});
        //console.log(this.inputRef.current);
        if(this.inputRef) this.inputRef.click();
    }

    handleSave(value) {
        const {
            input: { onChange, onBlur }
        } = this.props;
        onChange(value);
        onBlur(value);
    }

    render() {
        const {
            input,
            label,
            placeholder,
            type,
            meta: { touched, error, warning },
            dispatch
        } = this.props;

        const {pickerStyle} = this.state;

        const alignment = this.props.alignment || "horizontal";
        let thisDefaultStyles = { ...defaultStyles[alignment] };
        const style = Object.assign(thisDefaultStyles, this.props.style || {});
        /*console.log("HDate rendered");
        console.log(input);
        console.log(meta);*/
        const hDateLabel =
            input.value && typeof input.value.getLabel !== "undefined"
                ? input.value.getLabel()
                : input.value;
        /*console.log(input.value);
        console.log(hDateLabel);*/

        let dateInput = this;

        const {targetLol} = this;

        switch (alignment) {
            case "vertical":
                return (
                    <div ref={targetLol} style={{display:"inline"}}>
                        <FormGroup
                            validationState={
                                !touched
                                    ? null
                                    : error
                                    ? "error"
                                    : warning
                                        ? "warning"
                                        : "success"
                            }
                            style={style}
                        >
                            {label !== null && <ControlLabel>{label}</ControlLabel>}
                            <FormControl ref={targetLol}
                                value={hDateLabel}
                                component={(<input id="vachier" ref={targetLol}/>)}
                                onFocus={this.handleFocus}
                                onBlur={this.handleBlur}
                                type="text"
                                style={{
                                    textAlign: "inherit",
                                    display: "inline",
                                    fontSize: thisDefaultStyles.fontSize
                                }}
                                placeholder={placeholder}
                            />
                            <Overlay
                                rootClose={false}
                                show={this.state.show}
                                onHide={()=>{}}
                                placement="left"
                                container={null}
                                target={targetLol.current}
                            >
                                <Popover key={`popover-contained-${componentUid}`} id={`popover-contained-${componentUid}`}>
                                    <div ref={this.overlay}>
                                        <HDatePicker
                                            id={'reactbs-overlayed-date-picker'}
                                            style={pickerStyle}
                                            initialValue={input.value}
                                            onFocus={this.handleFocus}
                                            onClose={this.handleClose}
                                            onSave={this.handleSave}
                                        />
                                    </div>
                                </Popover>
                            </Overlay>
                            {touched && (error || warning) && (
                                <HelpBlock>{error || warning}</HelpBlock>
                            )}
                        </FormGroup>
                    </div>
                );
            default:
                return (
                    <FormGroup
                        validationState={
                            !touched
                                ? null
                                : error
                                ? "error"
                                : warning
                                    ? "warning"
                                    : "success"
                        }
                        style={style}
                    >
                        {label !== null && (
                            <Col sm={3} md={2}>
                                <ControlLabel>{label}</ControlLabel>
                            </Col>
                        )}
                        <Col sm={9} md={10}>
                            <OverlayTrigger
                                trigger="click"
                                placement="left"
                                overlay={
                                    <Popover id="popover-contained" arrowProps={null}>
                                        <HDatePicker
                                            id={'reactbs-overlayed-date-picker'}
                                            style={pickerStyle}
                                            initialValue={input.value}
                                            onClose={dateInput.handleClose}
                                            onSave={dateInput.handleSave}
                                        />
                                    </Popover>
                                }
                            >
                                <div ref={input => (this.inputRef = input)}>
                                    <FormControl
                                        value={hDateLabel}
                                        componentClass="input"
                                        //onFocus={this.handleFocus}
                                        //onBlur={this.handle}
                                        type="text"
                                        style={{
                                            textAlign: "inherit",
                                            fontSize: thisDefaultStyles.fontSize
                                        }}
                                        placeholder={placeholder}
                                    />
                                </div>
                            </OverlayTrigger>
                        </Col>

                        {touched && (error || warning) && (
                            <HelpBlock>{error || warning}</HelpBlock>
                        )}
                    </FormGroup>
                );
        }
    }
}

export default HDateInput;
