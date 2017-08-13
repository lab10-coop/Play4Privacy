import React from 'react';

function Credits() {
  return (
    <div>
      <div className='field' id='howToPlay'>
        <div className='fieldInner'>
          <h2>How to play</h2>
          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At
            vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
          <h2>Do you own the cryptocurrency Ethereum (ETH) ?</h2>
          <p>
            <span className='button' id='ethYesButton'>YES</span>
            <span className='button' id='ethNoButton'>NO</span>
          </p>
          <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
            tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
            eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
            takimata sanctus est Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
    </div>
  );
}

export default Credits;
