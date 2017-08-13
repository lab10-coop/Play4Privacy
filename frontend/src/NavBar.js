import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <header>
      <div className='inner'>
        <div className='logo'>Play 4 Privacy</div>
        <nav>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/credits'>Credits</Link></li>
            <li><Link to='/gameboard'>Gameboard</Link></li>
            <li><Link to='/leaderboard'>Leaders</Link></li>
            <li><Link to='/endgame'>Endgame</Link></li>
          </ul>
        </nav>
        <div className='clear' />
      </div>
    </header>
  );
}
export default NavBar;
