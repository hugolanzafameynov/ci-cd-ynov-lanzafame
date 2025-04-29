import {render, screen} from '@testing-library/react';
import UserList from './UserList';

describe('UserList', () => {
    test('should render the list of users', () => {
        const users = [
            {name: 'John', surname: 'Doe', email: 'john.doe@example.com'},
            {name: 'Jane', surname: 'Smith', email: 'jane.smith@example.com'}
        ];

        render(<UserList users={users}/>);

        expect(screen.getByText('John Doe - john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith - jane.smith@example.com')).toBeInTheDocument();
    });

    test('should render an empty message when no users are present', () => {
        render(<UserList users={[]}/>);

        expect(screen.getByText('Aucun utilisateur inscrit.')).toBeInTheDocument();
    });

    test('should render the user list in correct order', () => {
        const users = [
            {name: 'Zoe', surname: 'Brown', email: 'zoe.brown@example.com'},
            {name: 'Alex', surname: 'Johnson', email: 'alex.johnson@example.com'}
        ];

        render(<UserList users={users}/>);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Zoe Brown - zoe.brown@example.com');
        expect(listItems[1]).toHaveTextContent('Alex Johnson - alex.johnson@example.com');
    });
});
