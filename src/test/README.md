# TO RUN UNIT TESTS LOCALLY:
1. assuming you are in motm/src
2. npm run test

# Currently using testing framework:
1. Jest

## Potential libraries to explore
2. React testing library: doesnt have the ability to shallowly render components (i.e components without their child components) you can use Jest to mock child components.
##### Note: RTL is used in conjunction with JEST
3. Enzyme (RTL is the alternative / or replacement for Enzyme)

### files currently not included
1. envData.js
2. firebase.js
3. firestoreHelperFunctions.js
4. Login.js
5. serverWorker.js
6. ScrollToTop.js
7. setupTests.js


# Additional Notes for writing tests:
See ActivityFeedPost.spec.js for some basic notes