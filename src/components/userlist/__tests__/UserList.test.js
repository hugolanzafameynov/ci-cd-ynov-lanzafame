import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../UserList';

describe('UserList Component', () => {
    const mockUsers = [
        {
            id: 1,
            name: 'John',
            last_name: 'Doe',
            username: 'john.doe@example.com',
            role: 'user'
        },
        {
            id: 2,
            name: 'Jane',
            last_name: 'Smith',
            username: 'jane.smith@example.com',
            role: 'admin'
        }
    ];

    test('should render the list of users', () => {
        render(<UserList users={mockUsers} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
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
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getAllByText('Utilisateur')).toHaveLength(2); // Badge + Statut
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

    test('should handle users with different ID formats', () => {
        const usersWithDifferentIds = [
            { _id: 'mongo-id-1', name: 'Test', last_name: 'User', username: 'test@example.com', role: 'user' },
            { id: 2, name: 'Test2', last_name: 'User2', username: 'test2@example.com', role: 'user' }
        ];

        render(<UserList users={usersWithDifferentIds} />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Test2 User2')).toBeInTheDocument();
    });

    test('should handle admin role variations', () => {
        const usersWithAdminVariations = [
            { id: 1, name: 'Admin1', last_name: 'User', username: 'admin1@example.com', role: 'admin' },
            { id: 2, name: 'Admin2', last_name: 'User', username: 'admin2@example.com', is_admin: true }
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
