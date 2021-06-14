'use strict'

import React, { useContext } from "react";
import { unmountComponentAtNode } from "react-dom";
import { render, screen, fireEvent, act } from '@testing-library/react';

import ActivityFeed from "../ActivityFeed";
import { firestore } from '../setupTests';
import firebase from 'firebase/app';

import { AuthContext } from "../context";

firebase.firestore = firestore;

//Setup / Teardown
let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    //
    //jest.clearAllMocks();
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;

    jest.restoreAllMocks();
});

//may need to mock db calls

it("renders without crashing", () => {
    

    // jest.spyOn(global, "fetch").mockImplementation(() =>
    //     Promise.resolve({
    //         json: () => Promise.resolve(fakeUser)
    //     })
    // );
    // jest.spyOn(firebase, 'firestore').mockImplementationOnce(() => firestore);
    // //expect(firestore.collection).toBeCalledWith('users');

    render(
        <AuthContext.Provider value={{ userId: "TEST123" }} >
            <ActivityFeed />
        </AuthContext.Provider>
    
    );
    
    //expect(container.textContent).toBe("Hey, stranger");
});