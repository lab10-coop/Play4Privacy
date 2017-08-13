import React from 'react';

function NavBar() {
  return (
    <header>
      <div className='inner'>
        <div className='logo'>Play 4 Privacy</div>
        <nav>
          <ul>
            <li><a href='index.html'>Home</a></li>
            <li><a href='credits.html'>Credits</a></li>
            <li><a href='gameboard.html'>Gameboard</a></li>
            <li><a href='leaderboard.html'>Leaders</a></li>
            <li><a href='endgame.html'>Endgame</a></li>
          </ul>
        </nav>
        <div className='clear' />
      </div>
    </header>
  );
}
export default NavBar;
