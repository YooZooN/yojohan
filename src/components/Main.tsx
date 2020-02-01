import * as React from 'react';
import Preview from './Preview';
import Header from './Header';
import Menu from './Menu';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle({
  '@font-face': {
    fontFamily: 'PixelMPlus',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: 'url("/PixelMplus12-Regular.ttf") format("truetype")'
  },
  body: {
    fontFamily: 'PixelMPlus',
    fontSize: '12px',
    lineHeight: '12px',
    color: '#000',
    overflow: 'hidden'
  }
});

type DOMProps = {
  className?: string;
};

const DOM = ({ className }: DOMProps) => (
  <div className={className}>
    <GlobalStyle />
    <Header />
    <Preview />
    <Menu />
  </div>
);

const Styled = styled(DOM)({
  width: '100%',
  height: '100%',
  position: 'relative'
});

export default function Main() {
  return <Styled />;
}
