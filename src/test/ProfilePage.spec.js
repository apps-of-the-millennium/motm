'use strict'

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import ProfilePage from "../ProfilePage";
import { AuthContext } from "../context";
import { BrowserRouter } from 'react-router-dom'; //needed if you use <Link> inside component
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

//will have error until auth handler is removed!
it("renders without crashing", () => {
    act(() => {
        render(<AuthContext.Provider value={{ userId: "TEST123" }}> <BrowserRouter><ProfilePage /></BrowserRouter> </AuthContext.Provider>, container);
    });
    //expect(container.textContent).toBe("Hey, stranger");
});