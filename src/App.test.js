import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders users manager content', () => {
    render(<App/>);
    const titleElement = screen.getByText(/Users/i);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(/Users manager/i);
});

describe('Home Page', () => {
    it('devrait correspondre au snapshot', () => {
        const tree = render(<div>Hello world!</div>);
        fireEvent.click(tree.getByText('Hello world!'));
    });
});

test('renders 0 user', async () => {
    render(<App/>);
    const countUsers = screen.getByTestId("count");

    await waitFor(() => {
        expect(countUsers).toBeInTheDocument();
        expect(countUsers).toHaveTextContent(0);
    });

});

test('renders 2 users', async () => {
    const data = {
        data: {
            utilisateurs: [
                {
                    id: '1',
                    nom: 'a',
                    prenom: 'b',
                    email: 'c@c.fr'
                },
                {
                    id: '2',
                    nom: 'a',
                    prenom: 'b',
                    email: 'c@c.fr'
                }
            ],
        },
    };

    axios.get.mockImplementationOnce(() => Promise.resolve(data));
    render(<App/>);
    const countUsers = screen.getByTestId("count");

    await waitFor(() => {
        expect(countUsers).toBeInTheDocument();
        expect(countUsers).toHaveTextContent(2);
    });

});



