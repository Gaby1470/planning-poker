import { useState } from 'react';

const fibonacci = [0.5, 1, 2, 3, 5, 8, 13];
const tShirt = ['XS', 'S', 'M', 'L', 'XL'];

export const useVotingSystem = () => {
  const [system, setSystem] = useState('fibonacci');

  const setVotingSystem = (system: string) => {
    setSystem(system);
  };

  const getVotingOptions = () => {
    switch (system) {
      case 'fibonacci':
        return fibonacci;
      case 't-shirt':
        return tShirt;
      default:
        return fibonacci;
    }
  };

  return {
    votingSystem: system,
    setVotingSystem,
    getVotingOptions,
  };
};
