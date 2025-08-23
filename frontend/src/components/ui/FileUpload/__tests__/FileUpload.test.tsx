import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../FileUpload';

// Mock file for testing
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUpload', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  it('renders with default props', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        label="Upload your files" 
      />
    );
    
    expect(screen.getByText('Upload your files')).toBeInTheDocument();
  });

  it('shows accepted formats when accept prop is provided', () => {
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        accept=".pdf,.doc,.docx" 
      />
    );
    
    expect(screen.getByText('Accepted formats: .pdf,.doc,.docx')).toBeInTheDocument();
  });

  it('shows max file size when maxSize prop is provided', () => {
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        maxSize={5 * 1024 * 1024} // 5MB
      />
    );
    
    expect(screen.getByText('Max file size: 5 MB')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        error="File upload failed" 
      />
    );
    
    expect(screen.getByText('File upload failed')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        helperText="Select files to upload" 
      />
    );
    
    expect(screen.getByText('Select files to upload')).toBeInTheDocument();
  });

  it('handles file input change', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const file = createMockFile('test.txt', 1024, 'text/plain');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
  });

  it('handles multiple file selection', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} multiple />);
    
    const files = [
      createMockFile('test1.txt', 1024, 'text/plain'),
      createMockFile('test2.txt', 2048, 'text/plain')
    ];
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, files);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(files);
  });

  it('validates file size', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <FileUpload 
        onFileSelect={mockOnFileSelect}
        maxSize={1024} // 1KB limit
      />
    );
    
    const file = createMockFile('large-file.txt', 2048, 'text/plain'); // 2KB file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'File validation errors:', 
      ['large-file.txt: File size must be less than 1 KB']
    );
    expect(mockOnFileSelect).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles drag and drop', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const dropZone = document.querySelector('.cursor-pointer') as HTMLElement;
    const file = createMockFile('dropped-file.txt', 1024, 'text/plain');
    
    // Simulate drag over
    fireEvent.dragOver(dropZone, {
      dataTransfer: {
        files: [file]
    });
    
    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
    });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
  });

  it('shows drag over state', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const dropZone = document.querySelector('.cursor-pointer') as HTMLElement;
    
    fireEvent.dragOver(dropZone);
    
    expect(dropZone).toHaveClass('border-blue-400', 'bg-blue-50');
  });

  it('removes drag over state on drag leave', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const dropZone = document.querySelector('.cursor-pointer') as HTMLElement;
    
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);
    
    expect(dropZone).not.toHaveClass('border-blue-400', 'bg-blue-50');
  });

  it('displays selected files', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const file = createMockFile('test-file.txt', 1024, 'text/plain');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    expect(screen.getByText('(1 KB)')).toBeInTheDocument();
  });

  it('removes selected files', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const file = createMockFile('test-file.txt', 1024, 'text/plain');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await userEvent.upload(input, file);
    
    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    
    const removeButton = document.querySelector('.text-red-500') as HTMLElement; // Remove button
    await userEvent.click(removeButton);
    
    expect(screen.queryByText('test-file.txt')).not.toBeInTheDocument();
    expect(mockOnFileSelect).toHaveBeenLastCalledWith([]);
  });

  it('is disabled when disabled prop is true', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} disabled />);
    
    const dropZone = document.querySelector('.cursor-not-allowed') as HTMLElement;
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    expect(dropZone).toHaveClass('bg-gray-50', 'cursor-not-allowed');
    expect(input).toBeDisabled();
  });

  it('does not handle drag events when disabled', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} disabled />);
    
    const dropZone = document.querySelector('.cursor-not-allowed') as HTMLElement;
    const file = createMockFile('test-file.txt', 1024, 'text/plain');
    
    fireEvent.dragOver(dropZone, {
      dataTransfer: {
        files: [file]
    });
    
    expect(dropZone).not.toHaveClass('border-blue-400', 'bg-blue-50');
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file]
    });
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('formats file sizes correctly', () => {
    const { rerender } = render(
      <FileUpload onFileSelect={mockOnFileSelect} maxSize={1024} />
    );
    expect(screen.getByText('Max file size: 1 KB')).toBeInTheDocument();

    rerender(<FileUpload onFileSelect={mockOnFileSelect} maxSize={1024 * 1024} />);
    expect(screen.getByText('Max file size: 1 MB')).toBeInTheDocument();

    rerender(<FileUpload onFileSelect={mockOnFileSelect} maxSize={1024 * 1024 * 1024} />);
    expect(screen.getByText('Max file size: 1 GB')).toBeInTheDocument();
  });
});
}
}