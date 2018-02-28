## About

This is the sourcecode of the [Play4Privacy project](https://play.lab10.coop/), a project initiated by lab10 collective in cooperation with Kunsthaus Graz and others,  which took place on October 2017.    

Additional not-strictly-technical information can be found in the [project blog](https://medium.com/play4privacy).

## Web application

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

## More

For more documentation, also take a look at the Readme files in the sub-directories `blockchain` and `src/utilities`.
