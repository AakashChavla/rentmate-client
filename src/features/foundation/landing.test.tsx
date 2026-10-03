import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderApp } from '../../test/render';
import { LandingPage } from './components/LandingPage';
describe('localized landing', () => {
  it.each([
    ['en', 'Every property. Every person.'],
    ['hi', 'हर प्रॉपर्टी। हर व्यक्ति।'],
  ] as const)('renders in %s with real CTAs', (locale, title) => {
    renderApp(<LandingPage />, locale);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title);
    expect(
      screen.getAllByRole('link', { name: locale === 'en' ? 'Get started' : 'शुरू करें' })[0],
    ).toHaveAttribute('href', '/register');
  });
  it('has no axe violations in the English landing', async () => {
    const { container } = renderApp(<LandingPage />);
    const result = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
