import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumeForm } from '../ResumeForm';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fr' },
  }),
}));

// Mock store
vi.mock('../../store/useCVStore', () => ({
  useCVStore: () => ({ status: 'idle' }),
}));

describe('ResumeForm', () => {
  it('renders form with labels and submit button', () => {
    render(<ResumeForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('form.cvLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('form.skillsLabel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /form.submitButton/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ResumeForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /form.submitButton/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
