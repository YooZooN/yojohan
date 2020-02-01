import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { tatamiSize } from './Header';
import { FunitureAttrs } from '../defs';
import { funitures, save } from '../stores/funitures';

type Props = {
  funitureIndex: number;
  draggable?: boolean;
};
type DOMProps = FunitureAttrs & {
  className?: string;
  dragStart?: (e: React.MouseEvent | React.TouchEvent) => void;
};

const DOM = ({ className, color, width, x, y, height, rotateDeg, name, dragStart }: DOMProps) => (
  <g
    className={className}
    onMouseDownCapture={dragStart}
    onTouchStartCapture={dragStart}
    transform={`translate(${x},${y})`}
  >
    <rect
      fill={color}
      x=".5"
      y=".5"
      width={width - 1}
      height={height - 1}
      strokeWidth="1"
      stroke="#FFF"
    />
    <text x={width / 2} y={height / 2} textAnchor="middle" dominantBaseline="central" fill="#FFF">
      {name}
    </text>
  </g>
);

const Styled = styled(DOM)({});

export default observer(Funiture);
function Funiture({ funitureIndex, draggable }: Props) {
  const item = funitures[funitureIndex];
  const getPos = (e: MouseEvent | TouchEvent) => {
    const { clientX, clientY } = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0]
      : (e as MouseEvent);
    return { clientX, clientY };
  };

  const dragStart = draggable
    ? (e: React.TouchEvent | React.MouseEvent) => {
        const element = e.currentTarget as Element;
        const svgBase = element.parentElement?.parentElement as Element;

        // ブラウザ上のサイズ(px)とSVGのサイズの比率
        const rate = svgBase.clientWidth / (tatamiSize.get() * 1.5);

        const { clientX: startX, clientY: startY } = getPos(e.nativeEvent);
        const { x, y } = item;

        const move = (e: MouseEvent | TouchEvent) => {
          const { clientX, clientY } = getPos(e);
          item.x = x - Math.round((startX - clientX) / rate);
          item.y = y - Math.round((startY - clientY) / rate);
        };

        if ((e as React.TouchEvent).touches) {
          element.addEventListener('touchmove', move, { passive: true });
          const end = () => {
            element.removeEventListener('touchmove', move);
            element.removeEventListener('touchend', end);
            save();
          };
          element.addEventListener('touchend', end, { passive: true });
        } else {
          document.addEventListener('mousemove', move, { passive: true });
          const end = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', end);
            save();
          };
          document.addEventListener('mouseup', end, { passive: true });
        }
      }
    : undefined;

  return <Styled {...item} dragStart={dragStart} />;
}
