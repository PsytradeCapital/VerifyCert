import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders VerifyCert header', () => {
  render(<App />);
  const headerElement = screen.getByText(/VerifyCert/i);
  expect(headerElement).toBeInTheDocument();
});