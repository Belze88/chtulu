/**
 * @package hbase.js
 * @doc HDatePicker.js : HDatePicker modal definition
 * @requires jQuery
 */
const _PARSERS = {
    "1":hb.util.date.getParserFromStyle("1"),
    "3":hb.util.date.getParserFromStyle("3"),
    "4":hb.util.date.getParserFromStyle("4"),
    "5":hb.util.date.getParserFromStyle("5"),
    "6":hb.util.date.getParserFromStyle("6"),
    "7":hb.util.date.getParserFromStyle("7"),
    "8":hb.util.date.getParserFromStyle("8"),
};
/**
 * @doc setDefaultOption for HDatePicker
 * @param option
 * @returns {object}
 * @private
 */
let _setDefaultOption = function(option) {
    option.z = option.z || 7;
    option.fadeTime = option.fadeTime || 250;
    option.title = option.title || hb.util.trans.HDATEPICKER_DEFAULT_TITLE;
    option.position = option.position || { my: "left top", at: "left top", of: null };
    return option;
};
/**
 * @doc apply options to HDatePicker
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _applyOption = function(picker){
    let $modal = picker.$modal;
    $modal.dialog( "option", "title", picker.option.title );
    $modal.dialog( "option","position", picker.option.position );
};
/**
 * @doc builds modal for HDatePicker
 * @param {jQuery} $modal
 * @private
 */
let _build = function($modal){
    $modal.append("<label class='mx-2'><DATE_TYPE></label>&nbsp;");
    $('.ui-dialog-titlebar-close').append("<i class=\"fa fa-times-circle\"></i>");
    $modal.typeSelector = $("<select class='ui-corner-all'>").appendTo($modal);
    $.each(hb.util.trans.PARSING_TYPE_LABELS,function(key,value){
        $modal.typeSelector.append($("<option>", {value: key,text: value}));
        console.log("key : " + key + " - valeur " +value);
    });
    $modal.append("<br>");
    let $labelContainer = $("<div class='text-muted m-r visible-md-inline-block visible-lg-inline-block'>").appendTo($modal);
    $modal.inputLabel = $("<p/>").appendTo($labelContainer);
    $modal.inputContainer = $("<div>").appendTo($modal);
    $modal.dateInput = $("<input type='text' class='ui-corner-all' " +
        "style='min-height:23px' required='required' maxlength='30' size='20'>").appendTo($modal.inputContainer);
    $modal.inputContainer.append("&nbsp;");
    $modal.validateButton = $("<button class='btn btn-primary btn-sm'><i class=\"fa fa-check\" aria-hidden=\"true\"></i></button>")
        .appendTo($modal.inputContainer);

    $modal.errorSpan = $("<div disabled='disabled' class='ui-state-error alert alert-danger'></div>").appendTo($modal);
    $modal.append("<label>" + hb.util.trans.HDATEPICKER_TRANSLATOR("[DATE_RENDERING]") + " : </label>");
    $modal.dateLabel = $("<label>").appendTo($modal);
    $modal.append("<br>").append("<label>[min;max]</label> : ");
    $modal.dateInterval = $("<label>").appendTo($modal);
    $modal.append("<br>");
};
/**
 * @doc refresh HDatePicker
 * @param {hb.ui.HDatePicker} picker
 * @param {boolean} total - if true type and input values are updated from the current hdate value
 * @private
 */
let _refresh = function(picker,total = false)
{
    let $modal = picker.$modal;
    let type = $modal.typeSelector.find(":selected").val();
    $modal.inputLabel.text(hb.util.trans.PARSING_HELP[type]);
    $modal.dateLabel.empty();
    $modal.dateInterval.empty();
    if(total){$modal.dateInput.empty();}
    if(picker.hDate !== null){
        if(total){
            $modal.dateInput.val(picker.hDate.getCanonicalInput());
            $modal.typeSelector.val(picker.hDate.type);
        }
        $modal.dateInput.attr("placeholder",hb.util.trans.PARSING_PLACEHOLDERS[type]);
        $modal.dateLabel.text(picker.hDate.getLabel());
        $modal.dateInterval.text(picker.hDate.getIntervalLabel());
    }
    $modal.validateButton.button("enable").removeClass("ui-state-error");
    $modal.validateButton.children().first().removeClass("fa-exclamation-triangle").addClass("fa-check");
    $modal.errorSpan.hide();
    $modal.validateButton.show();

    // if date value is empty validation icon isn"t displayed
    // if($modal.dateInput.val() === "" ){$modal.validateButton.hide();}
    if(picker.errors.length > 0 ){
        $modal.validateButton.button("disable").addClass("ui-state-error");
        $modal.validateButton.children().first().removeClass("fa-check").addClass("fa-exclamation-triangle");
        $modal.errorSpan.show();
        $modal.errorSpan.text(picker.errors[0]);
    }
};
/**
 * function to call when input is changed
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _onInputChange = function(picker) {
    let $modal = picker.$modal;
    let type = $modal.typeSelector.find(":selected").val();
    let sDate = $modal.dateInput.val();
    picker.errors=[];
    picker.hDate = null;

    if(sDate === null || sDate === ''){
        _refresh(picker,false);
        return;
    }

    let date = null;
    if(type === "2"){
        let regex = new RegExp("^([^;]+);([^;]+)$");
        let regexArray = regex.exec(sDate);
        if(regexArray === null) {
            picker.errors.push(hb.util.trans.PARSING_ERRORS[5]);
            _refresh(picker,false);
            return;
        }

        date = _PARSERS["1"](regexArray[1],picker.errors);
        let endDate = _PARSERS["1"](regexArray[2],picker.errors);

        if(date !== null && endDate !== null){
            if(hb.util.date.dayDiff(endDate,date) < 1){
                picker.errors.push("La date de fin doit être strictement posterieure à la date de début");
                _refresh(picker,false);
                return;
            }
            picker.hDate = new hb.util.HDate("2",date,endDate);
        }
    }
    else{
        date = _PARSERS[type](sDate,picker.errors);
        console.log(picker.errors);
        if(date !== null) {picker.hDate = new hb.util.HDate(type,date);}
    }
    _refresh(picker,false);
};
/**
 * @doc function to call when hdate type is changed
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _onTypeChange = function(picker) {
    let $modal = picker.$modal;
    let type = $modal.typeSelector.find(":selected").val();

    if (picker.hDate !== null && picker.errors.length < 1){
        picker.hDate.setType(type);
        $modal.dateInput.val(picker.hDate.getCanonicalInput());
        _refresh(picker);
    }
    else{
        _onInputChange(picker);
    }
};
/**
 * @doc updates data-hdate attribute and value of the current picker element
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _updateElement = function(picker) {
    if(picker.errors.length > 0) {return;}
    if(! picker.hDate){
        picker.$element.first().val("");
        picker.$element.first().attr("data-hb-value","");
        picker.$element.first().change();
        return;
    }
    picker.$element.first().val(picker.hDate.getLabel());
    picker.$element.first().attr("data-hb-value",JSON.stringify(picker.hDate));
    picker.$element.first().change();
};
/**
 * @doc function to call when user validates the picker input
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _onValidate = function(picker) {
    _updateElement(picker);
    picker.mouseOn = false;
    picker.$modal.focusout();
};
/**
 * @doc apply events and dynamic to HDatePicker
 * @param {hb.ui.HDatePicker} picker
 * @private
 */
let _applyEvents= function(picker) {
    let $modal = picker.$modal;

    $modal.mouseenter(function(){picker.mouseOn = true;});
    $modal.mouseleave(function(){picker.mouseOn = false;});
    $modal.typeSelector.on("change",function(){_onTypeChange(picker);});
    $modal.dateInput.on("change",function(){_onInputChange(picker);});
    $modal.dateInput.on("keyup", function(event) {
        if(event.keyCode === 13){_onValidate(picker);}
        else{_onInputChange(picker);}
    });
    $modal.validateButton.on("click", function() {_onValidate(picker);});
    $modal.on("focusout", function(event)
    {
        if(picker.mouseOn || picker.preventedFocusout===true){
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        if(picker.$element === null) {return;}
        let $element = picker.$element;
        $element.attr("disabled","disabled");
        picker.unbind();
        setTimeout(function() {$element.removeAttr("disabled");$element.blur();}, 30);
        $element.prev().click();
        $element.blur();
    });
};

/**
 * @doc HDatePicker modal constructor
 * @class hb.ui.HDatePicker
 * @param {object} option
 */
let HDatePicker = function(option = {}) {
    this.option = _setDefaultOption(option);
    this.errors=[];
    this.$element=null;
    this.hDate=null;
    this.mouseOn = false;
    this.preventedFocusout=false;
    let picker = this;
    this.$modal =  $("<div>").dialog({
        autoOpen: false,
        dialogClass: "hb-hdate-widget hb-modal-z" + this.option.z,
        show: {
            effect: "fade",
            duration: this.option.fadeTime
        },
        close:function(){picker.unbind();}
    });
    _build(this.$modal);
    _applyOption(this);
    _applyEvents(this);
    return this;
};

let _prototype = {
    bind : function($element) {
        console.log($element);
        this.unbind();
        if($element === null){return;}
        this.$element=$element;
        $element.addClass( "hb-enabled");
        this.option.position = { my: "left top", at: "left top", of: $element };
        if(typeof ($element.first().attr("data-label")) !== "undefined"){
            this.option.title = this.$element.first().attr("data-label");}

        if(typeof ($element.first().attr("data-hb-value")) !== "undefined" && $element.first().attr("data-hb-value") !== ""){
            this.hDate = hb.util.HDate.prototype.parseFromJson($element.first().attr("data-hb-value"));
        }
        else if (this.hDate !== null){this.hDate = this.hDate.clone();}
        _refresh(this,true);
        _applyOption(this);
        this.preventedFocusout=true;
        let picker = this;
        setTimeout(function() {picker.preventedFocusout=false;}, 500);

        this.$modal.dialog("open");
    },
    unbind : function() {
        if(this.$element === null){return;}
        let $element = this.$element;
        $(function(){$($element).removeClass("hb-enabled");}).delay(30);
        this.$modal.dialog("close");
        this.$element=null;
    }
};
Object.assign(HDatePicker.prototype,_prototype);


$.widget( "hb.hdatepicker", {
    // default options
    options: {
    },

    // The constructor
    _create: function() {
        let $element = $(this.element);

        console.log("create hdatepicker widget");
        function enableDatePicker(){
            console.log(hb);
            if(! $element.hasClass("hb-enabled")){
                hb.ui.manager.get("hdatepicker").bind($element);
            }
        }
        function convertValue(){
            console.log($element.val() === "null");
            if($element.val() && $element.val() !== "null" && ! $element.attr("data-hb-value")){
                $element.attr("data-hb-value",$element.val());
                let hDate = hb.util.HDate.prototype.parseFromJson($element.attr("data-hb-value"));
                $element.val(hDate.getLabel());
            }
            $element.addClass("hb-initialized");
        }
        function eraseValue(){
            $element.removeClass("hb-initialized").removeAttr("data-hb-value");
        }


        $element.ready(convertValue).on("hb.load",convertValue).on("hb.unload",eraseValue)
            .on("focus keyup",function(){enableDatePicker();})
            .change(function(){
                let $element = $(this).first();
                if($element.attr("data-hb-value") === "undefined" || $element.attr("data-hb-value") === null ||
                    $element.attr("data-hb-value") === "") return;
                let hDate = hb.util.HDate.prototype.parseFromJson($element.attr("data-hb-value"));
                //if(hDate === null){
                //hDate = new hb.util.HDate("1",new Date());
                $element.hDate = hDate;
                //}
                let $partner;
                let partnerHDate = null;
                let newPartnerHDate = null;
                if(typeof $element.attr("data-date-ender") !== "undefined"){
                    $partner = $("#" + $element.attr("data-date-ender"));
                    if(! $partner.hasClass("hb-hdatepicker") ) return;

                    if(typeof $partner.attr("data-hb-value") !== "undefined" && $partner.attr("data-hb-value") !== null &&
                        $partner.attr("data-hb-value") !== ""){
                        partnerHDate =  hb.util.HDate.parseFromJson($partner.attr("data-hb-value"));
                    }
                    if(partnerHDate === null || partnerHDate.endDate < hDate.endDate){
                        newPartnerHDate = new hb.util.HDate("1",hDate.endDate);
                        $partner.attr("data-hb-value",JSON.stringify(newPartnerHDate));
                        $partner.val(newPartnerHDate.label);
                    }
                }
                else if(typeof $element.attr("data-date-beginner") !== "undefined"){
                    $partner = $("#" + $element.attr("data-date-beginner"));
                    if(! $partner.hasClass("hb-hdatepicker") ) return;
                    if(typeof $partner.attr("data-hb-value") !== "undefined" && $partner.attr("data-hb-value") !== null &&
                        $partner.attr("data-hb-value") !== ""){
                        partnerHDate =  hb.util.HDate.parseFromJson($partner.attr("data-hb-value"));
                    }
                    if(partnerHDate === null || partnerHDate.beginDate > hDate.beginDate){
                        newPartnerHDate = new hb.util.HDate("1",hDate.beginDate);
                        $partner.attr("data-hb-value",JSON.stringify(newPartnerHDate));
                        $partner.val(newPartnerHDate.label);
                    }
                }
            });
    },
    // Events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
    }
});

module.exports = HDatePicker;