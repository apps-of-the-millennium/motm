// import React, { useState } from 'react';

import React from 'react';
import Select, { components } from "react-select";

//TODO: attempt to use hooks, requires more research on how
// function CustomSearch() {
//     // const [newState, setNewState] = useState([]);

//     return (
//         <div>
//             <span style={{ fontWeight: '700', color: `#cfd2f5`, display: 'inline-block' }}>Tag</span>
//             <Select
//                 className="searchTag"
//                 options={this.options}
//                 styles={customSelectStyle}
//                 isMulti={true}
//                 onChange={this.handleSearchTagChange}
//                 hideSelectedOptions={false}
//                 components={{
//                     ValueContainer
//                 }}
//             />
//         </div>
//     );
// }


//Has custom styling for each component of the Select bar...requires more effort and research
//const customSelectStyle = {
  // option: (provided, state) => ({
  //   ...provided,
  //   borderBottom: '2px dotted green',
  //   color: state.isSelected ? 'yellow' : 'black',
  //   backgroundColor: state.isSelected ? 'green' : 'white'
  // }),
  // control: (provided) => ({
  //   ...provided,
  //   marginTop: "5%",
  // })
// }

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
        <span style={{ fontWeight: '700', color: `#cfd2f5`, display: 'inline-block' }}>Tag</span>
        <Select
          className="searchTag"
          options={this.props.options}
          isMulti={true}
          onChange={this.props.handleChange}
          hideSelectedOptions={false}
          components={{
            ValueContainer
          }}
        />
      </div>
    );
  }
}

export default CustomSelect;