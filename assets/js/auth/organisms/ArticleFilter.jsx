import React from "react";
import { connect} from 'react-redux';
import {Button,
    Row,
    Col,
    Form,
    Glyphicon,
    DropdownButton,
    MenuItem
} from 'react-bootstrap';
import { Field, reduxForm} from 'redux-form/immutable';
import ArticleStatusSelect from "../molecules/ArticleStatusSelect";
import ArticleTypeSelect from "../molecules/ArticleTypeSelect";
import HDateInput from "../../shared/molecules/HDateInput";
import HBFormField from '../hoc/HBFormField';

const formUid = require('uuid/v4')();
const Imm = require("immutable");

const validate = values => {
    const errors = {};
    /*console.log("validate");
    console.log(values);
    if (!values.title) {
        errors.title = 'Le titre est obligatoire'
    } else if (values.title.length > 64) {
        errors.title = `${values.title.length} caractères sur ${64} autorisés`
    }*/
    return errors;
};

const warn = values => {
    const warnings = {};
    /*if (values.title && values.title.length > 55) {
        warnings.title = `${values.title.length} caractères sur ${64} autorisés`
    }*/
    return warnings;
};

const FormWrapper = ({mini,children}) =>{
    if(mini) {
        return (<Form style={{display:'flex',flexDirection:'row',margin:'0px'}}>
            {children}
        </Form>);
    }
    else{
        return(<Form>
                <Row className="show-grid">
                    {children}
                </Row>
            </Form>
        );
    }
};

const FieldWrapper = ({mini,children,style}) =>{
    if(mini){
        return <div style={style}>{children}</div>
    }
    else{
        return(<Col md={3} style={style}>
            {children}
        </Col>);
    }
};

const LimitItem = ({limit,current})=>{
    return(<MenuItem
            className={'hb-number-selector'}
            eventKey={`${limit}`}
            active={+limit === + current}
        >
            {`${limit}`}
            </MenuItem>

    );
};

const LimitSelector = ({style,id,current,setLimit}) => {

    const limits = [10,30,50,75,100];

    const menuItems= limits.map((limit)=>(
        <MenuItem
            key={limit}
            className={'hb-number-selector'} eventKey={limit}
            active={+limit === +current}>
                {`${limit}`}
            </MenuItem>));

    return (<DropdownButton
            bsStyle={'default'}
            title={current}
            key={1}
            id={`dropdown-basic-${id}`}
            defaultOpen={false}
            rootCloseEvent={'click'}
            style={style}
            onSelect={(eventKey,event)=>{
                console.log(event);
                console.log(+eventKey);
                setLimit(+eventKey);
            }}
        >
            {menuItems}
        </DropdownButton>
    );
};

class ArticleFilter extends React.Component{
    constructor(props) {
        super(props);

        this.getCurrentFilter = this.getCurrentFilter.bind(this);

        this.id = require('uuid/v4')();
        this.mini = false;
        if(!this.props.mini || typeof this.props.mini==='undefined') this.mini=false;
        else this.mini=true;
        //console.clear();
        this.state = {
            data:null,
            fields:props.fields || ["keyword","type","status"],
            lastFilterKey:(props.searchBag && props.searchBag.search) || {}
        };

        console.log(props.searchBag);
        console.log(this.state.lastFilterKey);
    }

    componentDidMount() {
        /*console.log("test");
        console.log(document.getElementById(`dropdown-basic-${this.id}`));*/

        if(this.mini){
            const dropdownUl = document.querySelector(`[aria-labelledby="dropdown-basic-${this.id}"]`);
            if(!!dropdownUl && typeof dropdownUl !== 'undefined'){
                dropdownUl.classList.add("list-inline");
                dropdownUl.style.margin = "-37px 0 0 -10px";
                dropdownUl.style['min-width'] = '180px';
                dropdownUl.style['max-height'] = '40px';
            }
        }

        const {getOneById,initialize,id,dispatch} = this.props;
        if(this.state.lastFilterKey && Object.keys(this.state.lastFilterKey).length>0){
            console.log("search");
            console.log(this.state.lastFilterKey);
            initialize(Imm.Map(this.state.lastFilterKey));
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.searchBag !== this.props.searchBag){
            const prevSearch = (prevProps.searchBag && prevProps.searchBag.search) || {};
            const search = (this.props.searchBag && this.props.searchBag.search) || {};
            if(JSON.stringify(prevSearch) !== JSON.stringify(search)){
                this.setState({lastFilterKey:search});
                this.props.initialize(Imm.Map(search));
            }
        }
    }

    getCurrentFilter(){
        const {pendingForm} = this.props;
        const values = pendingForm.get("values");
        if(!values) return {};
        return values.toJS();
    }

    render(){
        console.log("render called");
        const { onSubmit, pristine, reset, submitting,load,valid,searchBag,setLimit } = this.props;

        const mini = this.mini;
        const fieldStyle = mini?{marginRight:'5px',padding:'0px',height:'100%'}:{};


        return (
            <FormWrapper mini={mini}>
                {this.state.fields.includes("keyword") &&
                <FieldWrapper mini={mini}>
                    <Field
                        name="keyword"
                        type="text"
                        component={HBFormField}
                        label=""
                        placeholder="Rechercher"
                        style={fieldStyle}
                    />
                </FieldWrapper>
                }
                {this.state.fields.includes("type") &&
                <FieldWrapper mini={mini}>
                    <Field
                        name="type"
                        type="select"
                        component={ArticleTypeSelect}
                        required={false}
                        label="Type"
                        style={fieldStyle}
                    />
                </FieldWrapper>
                }
                {this.state.fields.includes("status") &&
                <FieldWrapper mini={mini}>
                    <Field
                        name="status"
                        type="select"
                        component={ArticleStatusSelect}
                        required={false}
                        label="Statut"
                        style={fieldStyle}
                    />
                </FieldWrapper>
                }
                {this.state.fields.includes("beginHDate") &&
                <FieldWrapper mini={mini}>
                    <Field
                        name="beginHDate"
                        type="text"
                        component={HDateInput}
                        label="Début"
                        style={fieldStyle}
                    />
                </FieldWrapper>
                }
                {this.state.fields.includes("endHDate") &&
                <FieldWrapper mini={mini}>
                    <Field
                        name="endHDate"
                        type="text"
                        component={HDateInput}
                        label="Fin"
                        style={fieldStyle}
                    />
                </FieldWrapper>
                }
                {mini &&
                <FieldWrapper mini={mini}>
                    <LimitSelector
                        style={{marginLeft:'-10px',marginRight:'10px'}}
                        id = {this.id}
                        current={searchBag.limit}
                        setLimit={setLimit}
                    />
                </FieldWrapper>
                }
                <div className="clearfix visible-xs-block"/>
                <FieldWrapper mini={mini} style={mini?{minHeight:'80%'}:{}}>
                    <Button bsStyle="primary"
                            disabled={false}
                            onClick={()=>{
                                const lastFilter = this.getCurrentFilter();
                                this.setState({lastFilterKey:JSON.stringify(lastFilter)});
                                onSubmit(lastFilter);
                            }}
                            style={fieldStyle}
                    >
                        {!mini?'Filtrer':'Fil.'}&nbsp;<Glyphicon glyph="filter"/>
                    </Button>
                    &nbsp;
                    <Button bsStyle="warning"
                            disabled={false}
                            onClick={()=>{
                                onSubmit({});
                                if(this.state.lastFilterKey !== "{}"){
                                    ;
                                    this.setState({lastFilterKey:"{}"});
                                }
                                reset();
                            }}
                            style={fieldStyle}
                    >
                        {!mini?'Effacer':'Eff.'}&nbsp;<Glyphicon glyph="erase"/>
                    </Button>
                </FieldWrapper>
            </FormWrapper>
        );
    }
}



ArticleFilter = connect(
    state => {
        return {pendingForm:state.getIn(["form",formUid])}
    },
    { }
)(ArticleFilter);

ArticleFilter =  reduxForm({
    form: formUid,
    destroyOnUnmount:false,
    validate:validate,
    warn:warn
})(ArticleFilter);

export default ArticleFilter;