/**
 * define the HGeoPicker widget : creates one single instance of the DOM panel
 * returns a single widget object allowing fro retrieving the DOM panel element
 * and passing properties to it thanks to a redux container
 */

import {PopWidgetAdapter} from '../hoc/PopWidgetAdapter';
import React from 'react';
import ReactDOM from 'react-dom';

const windowPadding=15;

const id = 'chtulu-pop-widget';
const containerId = 'chtulu-pop-widget' + '-container';

const container = document.createElement("div");
container.style=Object.assign(container.style,{"z-index":15000});
container.id = containerId;
document.getElementById('hb-data').appendChild(container);

const widget = {
    id:id,
    dispatch:null,
    containerRef:null,
    map:null,

    props:function(props){
        if(!this.dispatch){
            return;
        }
        this.dispatch({type:'PROPS',props:props});
    },
    /**
     * returns the panel DOM element
     * @returns {HTMLElement}
     */
    getDOMElement:function(){
        const existingElement = document.getElementById(this.id);
        if(!! existingElement){
            //existingElement.remove();
            return existingElement;
        }

        // else create it
        // first unmount and clean the node
        const container = document.getElementById(containerId);
        try{
            ReactDOM.unmountComponentAtNode(container);
        }catch(e){};
        // then create
        const ref = ReactDOM.render(
            React.createElement(PopWidgetAdapter, {
                setDispatch:(dispatch)=>{widget.dispatch=dispatch},
                setMap:(map)=>{this.map=map;},
                key:this.id,
                id:this.id,
                initialValue:null,
                onFocus:()=>{},
                onClose:()=>{},
                onSave:()=>{},
                setContainerRef:this.setContainerRef,
            }, null)
            , container);

        console.log(ref);
        console.log('pop widget element : ',this.id,container,document.getElementById(this.id));
        console.log(container);
        console.log(container.firstElementChild);
        console.log(container.childNodes);
        console.log(container.childNodes.item(0));

        return container
    },
    setContainerRef:function(ref){
        this.containerRef = ref;
    },
    /**
     * adjust position of widget to stay inside the page
     */
    show:function(){
        console.log('widget containerRef',this.containerRef);
        const existingElement = document.getElementById(this.id);

        console.log('widget containerRef',this.containerRef);
        console.log('widget element',this.id,existingElement);

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

        this.props({style:style});
        console.log('widget style',style);

        existingElement.focus();

        if(!!this.map) this.map.invalidateSize();
    },
    onClick:function(e){
        //e.stopPropagation();
        //e.preventDefault();
        console.log('widget click');
    }

};

widget.props = widget.props.bind(widget);
widget.getDOMElement = widget.getDOMElement.bind(widget);
widget.setContainerRef = widget.setContainerRef.bind(widget);
widget.onClick = widget.onClick.bind(widget);

export default widget;