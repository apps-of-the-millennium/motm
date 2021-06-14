'use strict'

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import CategorySelector from "../CategorySelector";

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

it("renders without crashing when props.category is empty", () => {
    act(() => {
        render(<CategorySelector />, container);
    });
    //expect(container.textContent).toBe("Hey, stranger");
});

it("renders without crashing when props.category is ...", () => {});