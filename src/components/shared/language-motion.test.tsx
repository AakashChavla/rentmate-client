import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { useContext } from 'react';
import { MotionConfigContext } from 'motion/react';
import { renderApp } from '../../test/render';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PageTransition } from './PageTransition';
import { navigation } from '../../test/navigation';
function MotionProbe(): React.JSX.Element {
  const config = useContext(MotionConfigContext);
  return <span data-testid="motion-mode">{config.reducedMotion}</span>;
}
describe('locale persistence and reduced motion', () => {
  it('persists Hindi in the preference cookie and refreshes server components', () => {
    renderApp(<LanguageSwitcher />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'hi' },
    });
    expect(document.cookie).toContain('NEXT_LOCALE=hi');
    expect(navigation.refresh).toHaveBeenCalledOnce();
  });
  it('configures user preference and does not offset reduced-motion transitions', () => {
    renderApp(
      <>
        <MotionProbe />
        <PageTransition>
          <p data-testid="content">Fixture</p>
        </PageTransition>
      </>,
    );
    expect(screen.getByTestId('motion-mode')).toHaveTextContent('user');
    expect(screen.getByTestId('content').parentElement?.style.transform ?? '').not.toContain(
      '16px',
    );
  });
});
