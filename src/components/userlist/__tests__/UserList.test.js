import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../UserList';

describe('UserList Component', () => {
    const mockUsers = [
        {
            id: 1,
            name: 'John',
            lastName: 'Doe',
            username: 'john.doe@example.com',
            role: 'user',
            birthdate: '2000-01-01',
            city: 'Paris',
            postalCode: '75000',
            createdAt: '2024-01-01T12:00:00Z'
        },
        {
            id: 2,
            name: 'Jane',
            lastName: 'Smith',
            username: 'jane.smith@example.com',
            role: 'admin',
            birthdate: '1990-05-10',
            city: 'Lyon',
            postalCode: '69000',
            createdAt: '2023-12-01T08:30:00Z'
        }
    ];

    test('should render the list of users (user vs admin)', () => {
        render(<UserList users={mockUsers} isAdmin={false} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
        expect(screen.queryByText(/Date de naissance:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Ville:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Code postal:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Créé le:/i)).not.toBeInTheDocument();

        render(<UserList users={mockUsers} isAdmin={true} />);
        expect(screen.getAllByText('Date de naissance:')).toHaveLength(2);
        expect(screen.getAllByText('Ville:')).toHaveLength(2);
        expect(screen.getAllByText('Code postal:')).toHaveLength(2);
        expect(screen.getAllByText('Créé le:')).toHaveLength(2);
        expect(screen.getByText('2000-01-01')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('75000')).toBeInTheDocument();
        expect(screen.getByText('1990-05-10')).toBeInTheDocument();
        expect(screen.getByText('Lyon')).toBeInTheDocument();
        expect(screen.getByText('69000')).toBeInTheDocument();
    });

    test('should render an empty message when no users are present', () => {
        render(<UserList users={[]} />);

        expect(screen.getByText('Aucun utilisateur trouvé.')).toBeInTheDocument();
    });

    test('should render an empty message when users is null', () => {
        render(<UserList users={null} />);

        expect(screen.getByText('Aucun utilisateur trouvé.')).toBeInTheDocument();
    });

    test('should render an empty message when users is undefined', () => {
        render(<UserList users={undefined} />);

        expect(screen.getByText('Aucun utilisateur trouvé.')).toBeInTheDocument();
    });

    test('should display user roles correctly', () => {
        render(<UserList users={mockUsers} />);

        // Chercher les badges spécifiquement
        expect(screen.getAllByText('Utilisateur')).toHaveLength(1); // Un seul user
        expect(screen.getAllByText('Admin')).toHaveLength(1); // Un seul admin
    });

    test('should render user cards with proper structure', () => {
        render(<UserList users={mockUsers} />);

        const userCards = screen.getAllByTestId('user-card');
        expect(userCards).toHaveLength(2);
    });

    test('should show delete buttons when showActions is true', () => {
        const mockOnDelete = jest.fn();
        render(<UserList users={mockUsers} showActions={true} onDeleteUser={mockOnDelete} />);

        const deleteButtons = screen.getAllByTestId('delete-button');
        expect(deleteButtons).toHaveLength(2);
    });

    test('should not show delete buttons when showActions is false', () => {
        const mockOnDelete = jest.fn();
        render(<UserList users={mockUsers} showActions={false} onDeleteUser={mockOnDelete} />);

        const deleteButtons = screen.queryAllByTestId('delete-button');
        expect(deleteButtons).toHaveLength(0);
    });

    test('should call onDeleteUser when delete button is clicked', () => {
        const mockOnDelete = jest.fn();
        render(<UserList users={mockUsers} showActions={true} onDeleteUser={mockOnDelete} />);

        const firstDeleteButton = screen.getAllByTestId('delete-button')[0];
        fireEvent.click(firstDeleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith(mockUsers[0].id);
    });

    test('should handle admin role variations', () => {
        const usersWithAdminVariations = [
            { id: 1, name: 'Admin1', lastName: 'User', username: 'admin1@example.com', role: 'admin' },
            { id: 2, name: 'Admin2', lastName: 'User', username: 'admin2@example.com', role: 'admin' }
        ];

        render(<UserList users={usersWithAdminVariations} />);

        const adminBadges = screen.getAllByText('Admin');
        expect(adminBadges).toHaveLength(2);
    });

    test('should have proper CSS classes', () => {
        const { container } = render(<UserList users={mockUsers} />);

        expect(container.firstChild).toHaveClass('user-list');
        expect(screen.getByTestId('users-grid')).toHaveClass('users-grid');
    });
});
