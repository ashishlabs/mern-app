import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../TodoList';

describe('TodoList', () => {
    const mockHandleStatusChange = jest.fn();
    
    const mockTodo = {
        _id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        status: 'in-progress',
        priority: 'high',
        tags: ['test'],
        createdDate: '2024-03-20',
        dueDate: '2024-03-21'
    };

    const defaultProps = {
        todos: [mockTodo],
        handleStatusChange: mockHandleStatusChange,
        getStatusIndicator: () => <div>status</div>,
        getPriorityIcon: () => <div>priority</div>,
        handleOnEdit: jest.fn()
    };

    it('calls handleStatusChange when checkbox is clicked', () => {
        render(<TodoList {...defaultProps} />);
        
        // Find and click the checkbox
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        // Verify handleStatusChange was called with correct arguments
        expect(mockHandleStatusChange).toHaveBeenCalledWith('1', 'completed');
    });
}); 