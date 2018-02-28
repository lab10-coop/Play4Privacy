## About

This is the sourcecode of the [Play4Privacy project](https://play.lab10.coop/), a project initiated by lab10 collective in cooperation with Kunsthaus Graz and others,  which took place on October 2017.    

Additional not-strictly-technical information can be found in the [project blog](https://medium.com/play4privacy).

## Installing and Running the Web application

Install back-end and front-end dependencies:

```
npm i
cd frontend
npm i
```

Both front-end and back-end auto-reload source files on save,
the node.js back-end using nodemon, the react.js front-end webpack.
The combined front/back-end development environment can be started using:

```
npm start
```

Eslint is configured, but not enforced. Please try to commit your code without linting errors/warnings.

To run eslint manually use:

```
npm lint
```

To run unit tests automatically on every source file save/change use:

```
npm run test -- --watch
```

## Web Application Architecture

The Web-app is responsible for presenting the game to the user, process user input and distribute information to various other subsystems like Database, Blockchain and BIX.

Communication between front- and back-end is done using the time-tested and convenient to use socket.io library.

The communication architecture needs to be set up not to cause potential congestion for the server, especially request by (possibly thousands of) clients to the server clustered at the same moment in time should be avoided.

> "Do not call me, I call **you**" - _says the Server to the Client_

To that end we keep the current game state in storage on both the back- and front-end, using the "MobX" library on the front-end, MongoDB on the back-end. This allows us to keep requests from the client to the server to a minimum, all requests are broadcasted by the server to the client except for initial state requests and player-submitted moves. For the most part the client relies on incremental updates from the server to update its internal state:

![WebApp](images/WebApp.png?raw=true)

### Front-End

We decided for React.js as front-end framework, it is a powerful Web UI development environment and fits our strategic goals to expand to mobile development in the future.

In combination with the react-router library it also allows for deploying the front-end as purely static HTML/JavaScript/CSS, freeing up the back-end to solely concentrate on implementing the API needed to implement the game.

To store the game state we chose the "MobX" library, which allows for incredibly simple and concise code, especially when used with ES7 decorators.

Note: We had to patch the "custom-react-scripts" library to allow the use of ES7 Decorators, a merge request was sent to the library maintainer and accepted.

### Back-End

The Web-app back-end is responsible for coordinating the flow of information between various subsystems of the application.

It is implemented using node.js, since using the same language in the Web front- as well as back-end makes for more fluid development, and most libraries essential for implementation are already available as npm modules.

The server is packaged and deployed as Docker image using a GitLab CI/CD pipeline to staging/production servers.

At game end all data is persisted in a MongoDB database.

### Go Game Back-End

We used a stripped down version of the mature "WGo" library, which implements a sufficient set of Go rules we needed to implement the game.

### BIX Back-End

After difficulties getting communication directly from the node.js server to the BIX facade to run we settled on using the "Processing" development environment, which corresponds to the implementation driving the BIX Facade at the Kunsthaus Graz.

The implementation requests information about the current game state from the Web-app back-end, transforms it into a Matrix to display on the BIX Facade.

### Blockchain Back-End

Uses the web3 library to interact with the Ethereum Blockchain.

### Database

MongoDB provides a very easy to use interface to store data of played games, and query the data from various aspects.

## More

For more documentation, also take a look at the Readme files in the sub-directories `blockchain` and `src/utilities`.
