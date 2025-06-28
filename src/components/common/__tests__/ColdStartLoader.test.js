import { render, screen } from '@testing-library/react';
import ColdStartLoader from '../ColdStartLoader';

describe('ColdStartLoader Component', () => {
  test('should render with default message', () => {
    render(<ColdStartLoader />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    expect(screen.getByTestId('cold-start-loader')).toBeInTheDocument();
    expect(screen.getByTestId('cold-start-spinner')).toBeInTheDocument();
  });

  test('should render with custom message', () => {
    const customMessage = 'Réveil du serveur en cours...';
    render(<ColdStartLoader message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText('Chargement...')).not.toBeInTheDocument();
  });

  test('should render spinner element', () => {
    render(<ColdStartLoader />);

    const spinner = screen.getByTestId('cold-start-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('cold-start-spinner');
  });

  test('should have correct CSS classes', () => {
    render(<ColdStartLoader message="Test message" />);

    const loader = screen.getByTestId('cold-start-loader');
    const message = screen.getByTestId('cold-start-message');
    const spinner = screen.getByTestId('cold-start-spinner');

    expect(loader).toHaveClass('cold-start-loader');
    expect(message).toHaveClass('cold-start-message');
    expect(spinner).toHaveClass('cold-start-spinner');
  });

  test('should render empty message', () => {
    render(<ColdStartLoader message="" />);

    const message = screen.getByTestId('cold-start-message');
    expect(message).toBeInTheDocument();
    expect(message).toBeEmptyDOMElement();
  });

  test('should handle null message', () => {
    render(<ColdStartLoader message={null} />);

    // Should fallback to default or handle gracefully
    const loader = screen.getByTestId('cold-start-loader');
    expect(loader).toBeInTheDocument();
  });

  test('should handle undefined message prop', () => {
    render(<ColdStartLoader message={undefined} />);

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  test('should render long message correctly', () => {
    const longMessage = 'Ceci est un message très long qui teste la capacité du composant à gérer des textes de longueur importante sans problème de rendu.';
    render(<ColdStartLoader message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  test('should render HTML entities in message', () => {
    const messageWithEntities = 'Chargement en cours... &amp; traitement';
    render(<ColdStartLoader message={messageWithEntities} />);

    expect(screen.getByText(messageWithEntities)).toBeInTheDocument();
  });

  test('should maintain accessibility', () => {
    render(<ColdStartLoader message="Loading data" />);

    const loader = screen.getByTestId('cold-start-loader');
    expect(loader).toBeInTheDocument();

    // Check that the component is properly structured for screen readers
    const message = screen.getByText('Loading data');
    expect(message).toBeInTheDocument();
  });
});
