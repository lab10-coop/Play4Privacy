import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './Home';
import Credits from './Credits';
import './css/styles-responsive.css';
import './css/styles.css';

function Routes() {
  return (
    <div>
      <NavBar />
      <Switch>
        <Route path='/credits' component={Credits} />
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
