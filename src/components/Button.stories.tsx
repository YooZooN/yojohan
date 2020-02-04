import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs, text, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import styled from 'styled-components';

import Button from './Button';

const Base = styled(Button)`
  width: calc(100% - 10px);
  margin: 5px;
`;

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .addDecorator(withInfo({ inline: true }) as (a: any) => any)
  .add('base', () => (
    <Base
      onClick={action('clicked')}
      buttoncolor={select('Color', { Default: undefined, Danger: 'danger' }, undefined)}
    >
      {text('Text', 'sample')}
    </Base>
  ));
