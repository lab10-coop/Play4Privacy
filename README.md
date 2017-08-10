Install back-end and front-end dependencies:

- npm i
- cd frontend
- npm i

Both front-end and back-end auto-reload source files on save,
the node.js back-end using nodemon, react.js webpack.
The combined front/back-end development environment can be started using:

- npm start

Eslint is configured, but not enforced through a GitLab CI job. Please try
to commit your code without linting errors/warnings. If you use Visual Studio
Code the "ESlint" plugin works great and shows linting errors directly in the 
"Problems" tab.

To run eslint manually use:

- npm lint

Automated tests are available for both the front-end and the back-end,
to run them every time you change a source file in the project use:

- npm run test -- --watch