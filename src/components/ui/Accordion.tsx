'use client';
import { Accordion as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { ChevronDown } from 'lucide-react';
export const Accordion = Primitive.Root;
export function AccordionItem(props: ComponentProps<typeof Primitive.Item>): React.JSX.Element {
  return <Primitive.Item className="border-b border-border" {...props} />;
}
export function AccordionTrigger({
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>): React.JSX.Element {
  return (
    <Primitive.Header>
      <Primitive.Trigger
        className="group flex w-full items-center justify-between gap-4 py-5 text-start font-medium"
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}
export function AccordionContent(
  props: ComponentProps<typeof Primitive.Content>,
): React.JSX.Element {
  return (
    <Primitive.Content className="pb-5 text-sm leading-relaxed text-muted-foreground" {...props} />
  );
}
