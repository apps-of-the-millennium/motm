'use strict'

import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { render, screen, fireEvent, act } from '@testing-library/react';

import EditProfile from "../EditProfile";
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
    render(<AuthContext.Provider value={{ userId: "TEST123" }} ><EditProfile /></AuthContext.Provider>, container);
   
    //expect(container.textContent).toBe("Hey, stranger");
});