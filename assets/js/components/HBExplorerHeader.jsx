import React from "react";
import ReactDOM from "react-dom";

import { AVAILABLE_THEMES } from "../util/explorerUtil";

const Option = ({ onChange, value, currentValue }) => {
    let label = "";

    switch (value) {
        case AVAILABLE_THEMES.EDITOR:
            label = "lay. edition";
            break;
        case AVAILABLE_THEMES.SIDEVIEW:
            label = "lay. coté";
            break;
        case AVAILABLE_THEMES.VERTICAL:
            label = "lay. vertical";
            break;
        default:
            label = "Default";
            break;
    }

    const isActive = value === currentValue;
    const className = isActive ? `btn btn-primary active` : `btn btn-default`;

    return (
        <label
            className={className}
            onClick={() => {
                if (!isActive) {
                    onChange(value);
                }
            }}
        >
            <input
                type="radio"
                name="options"
                value={value}
            />
            {label}
        </label>
    );
};

export default props => {
    const { onChange, theme } = props;

    return (
        <div
            style={{ padding: `0px` }}
            className="btn-group btn-toggle"
            data-toggle="buttons"
        >
            <Option
                onChange={onChange}
                currentValue={theme}
                value={AVAILABLE_THEMES.EDITOR}
            />
            <Option
                onChange={onChange}
                currentValue={theme}
                value={AVAILABLE_THEMES.SIDEVIEW}
            />
            <Option
                onChange={onChange}
                currentValue={theme}
                value={AVAILABLE_THEMES.VERTICAL}
            />
        </div>
    );
};