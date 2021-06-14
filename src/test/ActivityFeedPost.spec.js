//see RTL tutorial: https://www.robinwieruch.de/react-testing-library
'use strict'

import React from "react";
// import { unmountComponentAtNode } from "react-dom";

//"act" is basically a wrapper that ensures stuff is finished rendering before u make assertions
// import { act } from "react-dom/test-utils"; 


import { render, screen, fireEvent, act } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { BrowserRouter } from 'react-router-dom'; //needed if you use <Link> inside component
import ActivityFeedPost from "../ActivityFeedPost";
import firebase from 'firebase/app';



//Setup / Teardown / NOT SURE IF NEEDED ANYMORE, MAY NEED IF TESTS GIVE LEAKY ERROR
//let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    // container = document.createElement("div");
    // document.body.appendChild(container);

    jest.clearAllMocks();
});

// afterEach(() => {
//     // cleanup on exiting
//     unmountComponentAtNode(container);
//     container.remove();
//     container = null;
// });

test("renders a media notification post without crashing (throwing error)", () => {
    const mockProps = {
        content: "Favourited",
        extraInfo: {
            pic: "",
            title: "test",
        },
        id: "123",
        timestamp: Date.now(), //is converted to Millis/Date.now() already in ActivityFeed.js before passing to ActivityFeedPost
        type: "notification"
    }

    render(
        <BrowserRouter>
            <ActivityFeedPost postInfo={mockProps} />
        </BrowserRouter>
    );

    //Important! when to use getBy vs. queryBy vs. findBy
    //screen.debug();
    expect(screen.getByText('Favourited')).toBeInTheDocument(); //use getBy for asserting if element is there (getBy returns error if not there), getBy is default!
    expect(screen.queryByText(/Liked/)).toBeNull(); //use queryBy for asserting if element is not there

    //use findBy for things that WILL be there eventually (i.e async)
    //for testing async operations, make the test async i.e async () => {...}
    //the first check sees if something is not there (first render);
    //second check is AFTER we pull lets say some info and the component re-renders
    // expect(screen.queryByText(/Signed in as/)).toBeNull();
    // expect(await screen.findByText(/Signed in as/)).toBeInTheDocument();


    // wait for the user to resolve
    // the example used in the tutorial has an async operation that retrieves user info, thus they used await to ensure the HTML has rendered twice 
    //(i.e retrieved the info and displays Signed in as)
    //this 
    // await screen.findByText(/Signed in as/);

    // expect(screen.queryByText(/Searches for JavaScript/)).toBeNull();

    // fireEvent.change(screen.getByRole('textbox'), {
    //   target: { value: 'JavaScript' },
    // });

    //User Events mimics events better than fireEvent, try to use User Events where possible (although it doesnt have all the features that FireEvent does)
    //await userEvent.type(screen.getByRole('textbox'), 'JavaScript');

    // expect(screen.getByText(/Searches for JavaScript/)).toBeInTheDocument();

});

xtest("renders a message type acitivty post successfullly", async () => {
    const mockProps = {
        content: "Hello there this is a message post",
        extraInfo: {},
        id: "123",
        timestamp: Date.now(), //is converted to Millis/Date.now() already in ActivityFeed.js before passing to ActivityFeedPost
        type: "message"
    }

    // const { rerender } = render(
    //     <BrowserRouter>
    //         <ActivityFeedPost postInfo={mockProps} />
    //     </BrowserRouter>);

    // rerender(<BrowserRouter>
    //     <ActivityFeedPost postInfo={mockProps} />
    // </BrowserRouter>);

    const abc = render(
        <BrowserRouter>
            <ActivityFeedPost postInfo={mockProps} />
        </BrowserRouter>);

    
//doesnt work 
    // const firestoreMock = {
    //     collection: jest.fn().mockReturnThis(),
    //     doc: jest.fn().mockReturnThis(),
    //     set: jest.fn().mockResolvedValueOnce(),
    // };
    // jest.spyOn(firebase, 'firestore').mockImplementationOnce(() => firestoreMock);

    // screen.debug();
    // expect(firestoreMock.collection).toHaveBeenCalledWith("users");



});