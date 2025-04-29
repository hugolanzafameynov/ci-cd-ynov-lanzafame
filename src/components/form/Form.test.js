import Form from './Form';
import '@testing-library/jest-dom';
import {render, fireEvent, screen} from '@testing-library/react';

// Mock de alert()
global.alert = jest.fn();

beforeEach(() => {
    render(<Form/>);
});

test('should render form fields', () => {
    // Vérifier si les champs du formulaire sont rendus
    expect(screen.getByLabelText(/Nom de famille :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de naissance :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville :/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code postal :/i)).toBeInTheDocument();
});

test('should show success message after form submission', () => {
    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2000-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: '75001'}});

    // Soumettre le formulaire
    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    // Vérifier si un message de succès est affiché après soumission
    expect(global.alert).toHaveBeenCalledWith('Enregistrement réussi !');
});

test('should show error when name is invalid', () => {
    // Laisser un champ "Nom" vide et soumettre
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});

    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    // Vérifier si l'erreur de validation est affichée
    expect(screen.getAllByText(/Nom de famille invalide/i)).toHaveLength(1);
});

test('should show error when age is under 18', () => {
    // Remplir le formulaire avec une date de naissance qui donne moins de 18 ans
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2010-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: '75001'}});

    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    // Vérifier si l'erreur de validation de l'âge est affichée
    expect(screen.getByText(/Vous devez avoir 18 ans minimum/i)).toBeInTheDocument();
});

test('should reset form after successful submission', () => {
    // Remplir le formulaire avec des données valides
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2000-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: '75001'}});

    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    // Vérifier que le formulaire est réinitialisé
    expect(screen.getByLabelText(/Nom de famille :/i).value).toBe('');
    expect(screen.getByLabelText(/Prénom :/i).value).toBe('');
    expect(screen.getByLabelText(/Email :/i).value).toBe('');
    expect(screen.getByLabelText(/Date de naissance :/i).value).toBe('');
    expect(screen.getByLabelText(/Ville :/i).value).toBe('');
    expect(screen.getByLabelText(/Code postal :/i).value).toBe('');
});

test('should show error when postal code is invalid', () => {
    // Laisser un champ "Code postal" invalide et soumettre
    fireEvent.change(screen.getByLabelText(/Nom de famille :/i), {target: {value: 'John'}});
    fireEvent.change(screen.getByLabelText(/Prénom :/i), {target: {value: 'Doe'}});
    fireEvent.change(screen.getByLabelText(/Email :/i), {target: {value: 'john.doe@example.com'}});
    fireEvent.change(screen.getByLabelText(/Date de naissance :/i), {target: {value: '2000-01-01'}});
    fireEvent.change(screen.getByLabelText(/Ville :/i), {target: {value: 'Paris'}});
    fireEvent.change(screen.getByLabelText(/Code postal :/i), {target: {value: 'abc123'}});

    const submitButton = screen.getByRole('button', {name: /S'enregistrer/i});
    fireEvent.click(submitButton);

    // Vérifier que l'erreur de code postal est affichée
    expect(screen.getByText(/Code postal invalide/i)).toBeInTheDocument();
});
