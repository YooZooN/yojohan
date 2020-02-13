import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { FunitureAttrs } from '../defs';
import { funitures, save, tatamiSize, selection, setDragging } from '../stores/funitures';
import * as matrix from '../defs/matrix';

type Props = {
  funitureIndex: number;
};
type DOMProps = FunitureAttrs & {
  className?: string;
  forwardedRef: React.RefObject<SVGGElement>;
  dragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  rotateStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  textEditStart: () => void;
  onTextEdit?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  textEditEnd?: () => void;
};

const DOM = ({
  className,
  forwardedRef,
  color,
  width,
  x,
  y,
  height,
  rotateDeg,
  name,
  dragStart,
  rotateStart,
  textEditStart,
  onTextEdit,
  textEditEnd
}: DOMProps) => (
  <g
    className={className}
    ref={forwardedRef}
    transform={`matrix(${matrix
      .toArray(matrix.transform(matrix.translate(x, y), matrix.rotate(rotateDeg)))
      .join(',')})`}
  >
    {rotateStart ? (
      <circle
        cx="0"
        cy={height / 2 + 5}
        r={3}
        fill={color}
        strokeWidth="1"
        stroke="#FFF"
        onMouseDown={rotateStart}
        onTouchStart={rotateStart}
      />
    ) : (
      undefined
    )}
    <g onMouseDown={dragStart} onTouchStart={dragStart} onDoubleClick={textEditStart}>
      <rect
        fill={color}
        x={-width / 2 + 0.5}
        y={-height / 2 + 0.5}
        width={width - 1}
        height={height - 1}
        strokeWidth="1"
        stroke="#FFF"
      />
      {onTextEdit ? (
        <foreignObject
          x={-width / 2 + 0.5}
          y={-height / 2 + 0.5}
          width={width - 1}
          height={height - 1}
        >
          <input
            type="text"
            value={name}
            onChange={onTextEdit}
            onKeyDown={
              textEditEnd ? e => (e.keyCode === 13 ? textEditEnd() : undefined) : undefined
            }
          />
        </foreignObject>
      ) : (
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#FFF">
          {name}
        </text>
      )}
    </g>
  </g>
);

const Styled = styled(DOM)(
  {
    '& input': {
      color: '#FFF',
      background: '#00000000',
      width: '100%',
      height: '100%',
      border: 'none',
      margin: '0',
      padding: '0',
      textAlign: 'center',
      userSelect: 'none'
    },
    '@keyframes selected': {
      to: { strokeDashoffset: 4 }
    }
  },
  p =>
    p.rotateStart
      ? {
          '& > g > rect': {
            strokeDasharray: '3 1',
            animation: `selected 0.5s linear infinite`
          }
        }
      : undefined,
  p => (p.onTextEdit ? { '& input': { userSelect: 'text' } } : undefined)
);

export const base = Styled;

export default observer(Funiture);
function Funiture({ funitureIndex }: Props) {
  const item = funitures[funitureIndex];
  const select = selection.get();

  const ref = React.createRef<SVGGElement>();

  React.useEffect(() => {
    if (!ref.current) return;
    const input = ref.current.querySelector('input');
    if (!input) return;

    if (select?.edit === 'text') {
      input.setSelectionRange(item.name.length, item.name.length);
      input.focus();
    } else {
      input.blur();
    }
  }, [select]);

  return (
    <Styled
      {...item}
      forwardedRef={ref}
      dragStart={
        select?.index === funitureIndex && select?.edit
          ? e => {
              setDragging(true);
              const [target, endEvent] = (e as React.TouchEvent).touches
                ? [e.currentTarget, 'touchend']
                : [document, 'mouseup'];
              const end = () => {
                setDragging(false);
                target.removeEventListener(endEvent, end);
              };
              target.addEventListener(endEvent, end, { passive: true });
            }
          : e =>
              dragStart(
                e,
                tatamiSize.get(),
                (svgBase, rate) => {
                  selection.set({ index: funitureIndex });
                  const { clientX: startX, clientY: startY } = getPos(e.nativeEvent);

                  return (e: MouseEvent | TouchEvent) => {
                    const { clientX, clientY } = getPos(e);
                    funitures[funitureIndex] = {
                      ...item,
                      x: item.x - Math.round((startX - clientX) / rate),
                      y: item.y - Math.round((startY - clientY) / rate)
                    };
                  };
                },
                save
              )
      }
      rotateStart={
        select?.index === funitureIndex
          ? e =>
              dragStart(
                e,
                tatamiSize.get(),
                (svgBase, rate) => {
                  selection.set({ index: funitureIndex });
                  const centerX = svgBase.left + item.x * rate;
                  const centerY = svgBase.top + item.y * rate;

                  return (e: MouseEvent | TouchEvent) => {
                    const { clientX, clientY } = getPos(e);
                    const vectorX = clientX - centerX;
                    const vectorY = clientY - centerY;
                    const degree = (Math.atan2(vectorY, vectorX) * 180) / Math.PI - 90;
                    funitures[funitureIndex].rotateDeg = Math.round(degree);
                  };
                },
                save
              )
          : undefined
      }
      textEditStart={() => selection.set({ index: funitureIndex, edit: 'text' })}
      onTextEdit={
        select?.index === funitureIndex && select?.edit === 'text'
          ? e => {
              item.name = e.target.value || '';
              save();
            }
          : undefined
      }
      textEditEnd={
        select?.index === funitureIndex && select?.edit === 'text'
          ? () => selection.set(undefined)
          : undefined
      }
    />
  );
}

function dragStart(
  e: React.TouchEvent | React.MouseEvent,
  tatamiSize: number,
  getDragHandler: (svgBase: DOMRect, rate: number) => (e: MouseEvent | TouchEvent) => void,
  save: () => void
) {
  setDragging(true);
  const element = e.currentTarget;
  const svg = element.parentElement?.parentElement?.parentElement as Element;
  const svgBase = svg.getBoundingClientRect();

  // ブラウザ上のサイズ(px)とSVGのサイズの比率
  const rate = svgBase.width / (tatamiSize * 1.5);

  const drag = getDragHandler(svgBase, rate);

  const [target, moveEvent, endEvent] = (e as React.TouchEvent).touches
    ? [element, 'touchmove', 'touchend']
    : [document, 'mousemove', 'mouseup'];

  target.addEventListener(moveEvent, drag, { passive: true });
  const end = () => {
    setDragging(false);
    target.removeEventListener(moveEvent, drag);
    target.removeEventListener(endEvent, end);
    save();
  };
  target.addEventListener(endEvent, end, { passive: true });
}
function getPos(e: MouseEvent | TouchEvent) {
  const { clientX, clientY } = (e as TouchEvent).touches
    ? (e as TouchEvent).touches[0]
    : (e as MouseEvent);
  return { clientX, clientY };
}
