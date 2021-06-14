'use strict'

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import ReviewEditPage from "../ReviewEditPage";
import { AuthContext } from "../context";
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

it("renders without crashing", () => {
    act(() => {
        render(<AuthContext.Provider value={{ userId: "TEST123" }}> <ReviewEditPage location={{state: {mediaInfo: []}}}/> </AuthContext.Provider>, container);
    });
    //expect(container.textContent).toBe("Hey, stranger");
});