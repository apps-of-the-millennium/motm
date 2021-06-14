'use strict' 

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import App from "../App";

//Setup / Teardown
let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

//act(() => { //makes sure units of interaction with a UI (i.e user events, rendering, data fetching) are processed and applied to DOM before we write assertions
    // render components
// });
  // make assertions

it("renders without crashing (throwing error)", () => {
    act(() => {
        render(<App />, container);
    });
    //expect(container.textContent).toBe("Hey, stranger");
});