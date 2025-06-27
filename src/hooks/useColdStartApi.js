import { useState } from 'react';

// Hook personnalisé pour gérer les cold starts
export const useColdStartApi = () => {
  const [isColdStartLoading, setIsColdStartLoading] = useState(false);
  const [coldStartMessage, setColdStartMessage] = useState('');

  const executeWithColdStart = async (apiCall, loadingMessage = 'Chargement...') => {
    setIsColdStartLoading(true);
    setColdStartMessage(loadingMessage);

    try {
      const result = await apiCall();
      return result;
    } finally {
      setIsColdStartLoading(false);
      setColdStartMessage('');
    }
  };

  return {
    isColdStartLoading,
    coldStartMessage,
    executeWithColdStart
  };
};

export default useColdStartApi;
