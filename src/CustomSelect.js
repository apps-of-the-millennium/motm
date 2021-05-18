// import React, { useState } from 'react';

import React from 'react';
import Select, { components } from "react-select";

//Has custom styling for each component of the Select bar...requires more effort and research
const customSelectStyle = {
  option: (provided, state) => ({
    ...provided,
    // color: state.isSelected ? 'yellow' : 'black',
    color: '#cfd2f5',
    paddingLeft: '20px',
    background: state.isSelected ?  '#213663' : '#13203b',
    "&:hover": { //& always refers to the parent selector when nested
      backgroundColor: '#213663'
    }
  }),
  control: (provided, state) => ({
    ...provided,
    //minHeight is default to 38px, adjust Search input to match if looking to change
    width: 'inherit',
    background: '#13203b',
    
    border: state.isFocused ? 0 : 0,
    // This line disable the blue border
    boxShadow: state.isFocused ? 0 : 0,
    '&:hover': {
       border: state.isFocused ? 0 : 0
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#13203b'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#cfd2f5',
    paddingBottom: "2px",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: '#cfd2f5',
    textAlign: 'left'
  }),
  valueContainer: (provided) => ({
    ...provided,
    color: '#cfd2f5',
    cursor:"text",
  }),
  input: (provided) => ({
    ...provided,
    color: '#cfd2f5',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'grey',
  }),
  groupHeading: (provided) => ({
    ...provided,
    color: '#cfd2f5',
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
        <div style={{ fontWeight: '500', color: `#cfd2f5` , marginBottom:'10px' }}>{this.props.label}</div>
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