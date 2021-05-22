// import React, { useState } from 'react';

import React from 'react';
import Select, { components } from "react-select";

//Has custom styling for each component of the Select bar...requires more effort and research
const customSelectStyle = {
  option: (provided, state) => ({
    ...provided,
    // color: state.isSelected ? 'yellow' : 'black',
    color: 'var(--color-text)',
    paddingLeft: '20px',
    background: state.isSelected ?  'var(--color-background-light-hover)' : 'var(--color-background-light)',
    "&:hover": { //& always refers to the parent selector when nested
      backgroundColor: 'var(--color-background-light-hover)'
    }
  }),
  control: (provided, state) => ({
    ...provided,
    //minHeight is default to 38px, adjust Search input to match if looking to change
    width: 'inherit',
    background: 'var(--color-background-light)',
    transition:'background 1s',
    
    border: state.isFocused ? 0 : 0,
    // This line disable the blue border
    boxShadow: state.isFocused ? 0 : 0,
    '&:hover': {
       border: state.isFocused ? 0 : 0
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--color-background-light)',
    transition:'backgroundColor 1s'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--color-text)',
    transition:'color 1s',
    paddingBottom: "2px",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'var(--color-text)',
    transition:'color 1s',
    textAlign: 'left'
  }),
  valueContainer: (provided) => ({
    ...provided,
    color: 'var(--color-text)',
    transition:'color 1s',
    cursor:"text",
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--color-text)',
    transition:'color 1s'
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'grey',
  }),
  groupHeading: (provided) => ({
    ...provided,
    color: 'var(--color-text)',
    transition:'color 1s'
  }),
}

const ValueContainer = ({ children, getValue, ...props }) => { //not fit for mobile, elements will be expanded veritcally
  var values = getValue();
  var valueLabel = "";

  if (values.length > 0) valueLabel += props.selectProps.getOptionLabel(values[0]);
  if (values.length > 1) valueLabel += ` + ${values.length - 1}`;

  // Keep standard placeholder and input from react-select
  var childsToRender = React.Children.toArray(children).filter((child) => ['Input', 'DummyInput', 'Placeholder'].indexOf(child.type.name) >= 0);

  return (
    <components.ValueContainer {...props}>
      {!props.selectProps.inputValue && valueLabel}
      {childsToRender}
    </components.ValueContainer>
  );
};

class CustomSelect extends React.Component {
  render() {
    return (
      <div>
        <div style={{ fontWeight: '500', color: `var(--color-text)`, transition:'color 1s', marginBottom:'10px' }}>{this.props.label}</div>
        <Select
          closeMenuOnSelect={false}
          // placeholder={'any'}
          options={this.props.options}
          isMulti={true}
          onChange={this.props.handleChange}
          hideSelectedOptions={false}
          components={{
            ValueContainer,
            // IndicatorSeparator: () => null
          }}
          styles={customSelectStyle}
        />
      </div>
    );
  }
}

export default CustomSelect;