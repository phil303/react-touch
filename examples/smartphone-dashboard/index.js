import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './Dashboard.react';
import times from 'lodash/times';

// turn off contextmenu on desktop
document.oncontextmenu = () => false;

const COLORS = [ '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868' ];
const MAX_ICONS = 9;
const MIN_ICONS = 6;

const createIcons = numPages => {
  return times(numPages, () => {
    const numIcons = Math.round(Math.random() * (MAX_ICONS - MIN_ICONS) + MIN_ICONS);
    return times(numIcons, idx => {
      return { id: idx, color: COLORS[Math.floor(Math.random() * 10) % COLORS.length] };
    });
  });
};

const width = Math.min(window.innerWidth, 450);
const height = Math.min(window.innerHeight, 700);

ReactDOM.render(
  <Dashboard pages={createIcons(3)} width={width} height={height} />,
  document.getElementById('content')
);
