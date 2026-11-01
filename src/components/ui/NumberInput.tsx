import * as React from 'react';
import { Input, type InputProps } from './Input';

export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <Input ref={ref} type="number" {...props} className={props.className} />;
  }
);
NumberInput.displayName = 'NumberInput';
