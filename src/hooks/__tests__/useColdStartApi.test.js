import { renderHook, act } from '@testing-library/react';
import { useColdStartApi } from '../useColdStartApi';

describe('useColdStartApi Hook', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useColdStartApi());

    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
    expect(typeof result.current.executeWithColdStart).toBe('function');
  });

  test('should set loading state during API call', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve('success'), 100))
    );

    act(() => {
      result.current.executeWithColdStart(mockApiCall, 'Loading test...');
    });

    expect(result.current.isColdStartLoading).toBe(true);
    expect(result.current.coldStartMessage).toBe('Loading test...');

    // Wait for the API call to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
  });

  test('should return API call result', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => Promise.resolve('test result'));

    let apiResult;
    await act(async () => {
      apiResult = await result.current.executeWithColdStart(mockApiCall);
    });

    expect(apiResult).toBe('test result');
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  test('should handle API call errors', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockError = new Error('API Error');
    const mockApiCall = jest.fn(() => Promise.reject(mockError));

    let thrownError;
    await act(async () => {
      try {
        await result.current.executeWithColdStart(mockApiCall);
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBe(mockError);
    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
  });

  test('should use default loading message', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve('success'), 50))
    );

    act(() => {
      result.current.executeWithColdStart(mockApiCall);
    });

    expect(result.current.coldStartMessage).toBe('Chargement...');

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  test('should reset state after successful API call', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => Promise.resolve('success'));

    await act(async () => {
      await result.current.executeWithColdStart(mockApiCall, 'Test message');
    });

    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
  });

  test('should reset state after failed API call', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => Promise.reject(new Error('Failed')));

    await act(async () => {
      try {
        await result.current.executeWithColdStart(mockApiCall, 'Test message');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
  });

  test('should handle multiple concurrent API calls', async () => {
    const { result } = renderHook(() => useColdStartApi());

    const mockApiCall1 = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve('result1'), 100))
    );
    const mockApiCall2 = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve('result2'), 50))
    );

    act(() => {
      result.current.executeWithColdStart(mockApiCall1, 'Call 1');
      result.current.executeWithColdStart(mockApiCall2, 'Call 2');
    });

    expect(result.current.isColdStartLoading).toBe(true);
    expect(result.current.coldStartMessage).toBe('Call 2'); // Last call wins

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isColdStartLoading).toBe(false);
    expect(result.current.coldStartMessage).toBe('');
  });

  test('should maintain loading state across re-renders', async () => {
    const { result, rerender } = renderHook(() => useColdStartApi());

    const mockApiCall = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve('success'), 100))
    );

    act(() => {
      result.current.executeWithColdStart(mockApiCall, 'Loading...');
    });

    expect(result.current.isColdStartLoading).toBe(true);

    rerender();

    expect(result.current.isColdStartLoading).toBe(true);
    expect(result.current.coldStartMessage).toBe('Loading...');

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
  });
});
