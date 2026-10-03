import { useTranslations } from 'next-intl';
import { FAQ } from '../../../config/landing.constants';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../components/ui/Accordion';
export function LandingFaq(): React.JSX.Element {
  const t = useTranslations();
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 md:px-8">
      <h2 className="mb-10 text-center font-display text-3xl font-bold tracking-tight">
        {t('common.faqTitle')}
      </h2>
      <Accordion type="single" collapsible>
        {FAQ.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{t(item.question)}</AccordionTrigger>
            <AccordionContent>{t(item.answer)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
