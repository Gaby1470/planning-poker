import { useState } from 'react';

const fibonacci = [0.5, 1, 2, 3, 5, 8, 13];
const tShirt = ['XS', 'S', 'M', 'L', 'XL'];
const sequential = [0.5, 1, 2, 3, 4, 5];

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
      case 'sequential':
        return sequential;
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
