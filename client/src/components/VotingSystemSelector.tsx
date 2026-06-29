
const VotingSystemSelector = ({ selected, onChange }: { selected: string, onChange: (value: string) => void }) => {
  const options = [
    { value: 'fibonacci', label: 'Fibonacci' },
    { value: 't-shirt', label: 'T-Shirt Sizes' },
    { value: 'sequential', label: 'Sequential' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Voting System</h4>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {options.map((option) => (
          <button
            key={option.value}
            className={selected === option.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => onChange(option.value)}
            style={{ flex: 1, padding: '0.75rem' }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VotingSystemSelector;

