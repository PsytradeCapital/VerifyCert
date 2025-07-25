import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders VerifyCert he
test('renders VerifyCert header', () => {
  render(<App />);
  const headerElement = screen.getByRole('heading', { name: /VerifyCert/i, level: 1 });
  expect(headerElement).toBeInTheDocument();
});