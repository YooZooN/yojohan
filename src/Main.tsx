import * as React from 'react';
import Preview from './Preview';
import Header from './Header';
import Menu from './Menu';

export default function Main() {
  return (
    <div className="main">
      <Header />
      <Preview />
      <Menu />
    </div>
  );
}
