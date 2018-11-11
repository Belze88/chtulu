import React,{ Component } from "react";
import {ControlLabel,FormGroup,FormControl} from 'react-bootstrap';
import {getIfNeeded} from '../actions';
import {getSelector} from "../reducers";
import { connect } from 'react-redux'
import SearchBag from "../util/SearchBag";
import {getComponentClassType} from '../util/formUtil';
import HBFormField from './HBFormField';

class ArticleTypeSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchBag:SearchBag(),
            items:props.selector,
        };
    }

    componentDidMount() {
        const {dispatch} = this.props;
        dispatch(getIfNeeded("articleType"));
    }

    render(){
        console.log("render article Select");
        const { input, label, type, meta: { touched, error } ,selector} = this.props;
        const options =  selector(this.state.searchBag).map((rec) =>{
            return(
                <option key={rec.get("id")} value={rec.get("id")}>
                    {rec.get("label")}
                </option>
            );
        });
        //console.log(options);

        {/*<FormGroup validationState={null} controlId="formControlsSelect">*/}
        {/*<ControlLabel>{label}</ControlLabel>*/}
        {/*<FormControl*/}
        {/*{...input}*/}
        {/*componentClass={getComponentClassType(type)}*/}
        {/*type={type}*/}
        {/*placeholder={label}>*/}
        {/*{options}*/}
        {/*</FormControl>*/}
        {/*</FormGroup>*/}

        return(
            <HBFormField {...this.props} options={options}/>
        );
    }
}

const mapStateToProps = (state) => {
    const selector = selector || getSelector(state.get("articleType"));
    return {
        selector: selector
    }
};

export default connect(mapStateToProps)(ArticleTypeSelect);