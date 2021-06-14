'use strict'

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import ReviewPost from "../ReviewPost";
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

it("renders without crashing", () => {
    act(() => {
        render(<BrowserRouter><ReviewPost allReviewInfo={{uid: "123", reviewInfo: {summary: ""}}}/></BrowserRouter>, container);
    });
    //expect(container.textContent).toBe("Hey, stranger");
});