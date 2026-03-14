import { CalendarIcon } from 'lucide-react';
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  type DateValue,
  type ValidationResult
} from 'react-aria-components';
import { DateInput } from './DateField';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { Popover } from './Popover';
import { RangeCalendar } from './RangeCalendar';
import { composeTailwindRenderProps } from './utils';
import { FieldButton } from './FieldButton';

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>(
  { label, description, errorMessage, ...props }: DateRangePickerProps<T>
) {
  return (
    <AriaDateRangePicker {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans max-w-full')}>
      {label && <Label>{label}</Label>}
      <FieldGroup className=" w-full h-auto min-h-10 cursor-text disabled:cursor-default">
  
        {/* py-3 dá um respiro de 12px em cima e embaixo, gap-1 afasta um texto do outro */}
        <div className="flex-1 flex flex-col justify-center py-1  overflow-x-auto overflow-y-clip [scrollbar-width:none]">
          <DateInput slot="start" className="px-3 text-sm font-medium" />
          <DateInput slot="end" className="px-3 text-sm text-neutral-500 dark:text-neutral-400" />
        </div>
        
        {/* Coloquei um flex e items-center aqui pro ícone continuar bem no meio da caixa */}
        <FieldButton className="w-6 mr-2 outline-offset-0 flex items-center justify-center">
          <CalendarIcon aria-hidden className="w-4 h-4" />
        </FieldButton>

      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="p-2">
        <RangeCalendar />
      </Popover>
    </AriaDateRangePicker>
  );
}
