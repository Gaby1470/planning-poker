import { useState, useCallback } from 'react';

const fibonacci = [0.5, 1, 2, 3, 5, 8, 13];
const tShirt = ['XS', 'S', 'M', 'L', 'XL'];
const sequential = [0.5, 1, 2, 3, 4, 5];

export const useVotingSystem = () => {
  const [system, setSystem] = useState('fibonacci');

  const setVotingSystem = useCallback((system: string) => {
    setSystem(system);
  }, []);

  const getVotingOptions = useCallback(() => {
    switch (system) {
      case 'fibonacci':
        return fibonacci;
      case 't-shirt':
        return tShirt;
      case 'sequential':
        return sequential;
      default:
        return fibonacci;
    }
  }, [system]);

  return {
    votingSystem: system,
    setVotingSystem,
    getVotingOptions,
  };
};
