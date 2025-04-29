import Form from './Form';
import '@testing-library/jest-dom';
import {render, fireEvent, screen} from '@testing-library/react';

// Mock de alert()
const addUser = jest.fn();

beforeEach(() => {
    render(<Form addUser={addUser} />);
});

test('should render form fields', () => {
    expect(screen.getByLabelText(/Nom de famille :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de naissance :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code postal :/i)).toBeInTheDocument();
});

test('should show error when name is invalid', () => {
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: ''}});
    expect(screen.getAllByText(/Nom de famille invalide/i)).toHaveLength(1);
});

test('should show error when age is under 18', () => {
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2010-01-01'}});
    expect(screen.getByText(/Vous devez avoir 18 ans minimum/i)).toBeInTheDocument();
});

test('should show error when postal code is invalid', () => {
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: 'abc123'}});
    expect(screen.getByText(/Code postal invalide/i)).toBeInTheDocument();
});

test('should reset form after successful submission', () => {
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2000-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: '75001'}});

    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    expect(screen.getByLabelText(/Nom de famille :/i).value).toBe('');
    expect(screen.getByLabelText(/Prénom :/i).value).toBe('');
    expect(screen.getByLabelText(/Email :/i).value).toBe('');
    expect(screen.getByLabelText(/Date de naissance :/i).value).toBe('');
    expect(screen.getByLabelText(/Ville :/i).value).toBe('');
    expect(screen.getByLabelText(/Code postal :/i).value).toBe('');
});

test('should show success message after form submission', () => {
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2000-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: '75001'}});

    fireEvent.click(screen.getByRole('button', { name: /S'enregistrer/i }));
    expect(screen.getByText('Enregistrement réussi !')).toBeInTheDocument();
});