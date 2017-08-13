import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './Home';

function Routes() {
  return (
    <div>
      <NavBar />
      <Switch>
        <Route path='/' component={Home} />
      </Switch>
    </div>
  );
}

// ========================================

ReactDOM.render(
  <Router>
    <Routes />
  </Router>,
  document.getElementById('react_root'),
);
