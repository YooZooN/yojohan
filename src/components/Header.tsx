import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Input from './Input';

/** 畳の長辺の長さ(cm) */
export const tatamiSize = observable.box(88 * 2);

type DOMProps = {
  className?: string;
  tatamiSize: number;
  setTatamiSize: (size: number) => void;
};

const DOM = ({ className, tatamiSize, setTatamiSize }: DOMProps) => (
  <div className={className}>
    畳サイズ:
    <Input type="number" value={tatamiSize} onChange={v => setTatamiSize(Number(v.target.value))} />
    cm
  </div>
);

const Styled = styled(DOM)({
  position: 'relative',
  width: '100vw',
  height: '35px',
  lineHeight: '35px',
  color: '#aaa',
  opacity: 0.9,
  background: '#fee',
  textAlign: 'right',

  '&:before': {
    content: '"四畳半シミュレータ"',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '35px',
    textAlign: 'center',
    color: '#000',
    transform: 'scale(1.3)',
    pointerEvents: 'none'
  },
  [`& > ${Input}[type="number"]`]: {
    width: '18px',
    color: '#aaa',
    border: 'solid 1px #ddd'
  }
});

export default observer(Header);
function Header() {
  return <Styled tatamiSize={tatamiSize.get()} setTatamiSize={size => tatamiSize.set(size)} />;
}