
const VotingSystemSelector = ({ selected, onChange }: { selected: string, onChange: (value: string) => void }) => {
  const options = [
    { value: 'fibonacci', label: 'Fibonacci' },
    { value: 't-shirt', label: 'T-Shirt Sizes' },
  ];

  return (
    <div className="flex items-center space-x-4">
      <h4 className="text-lg font-semibold text-gray-800">Voting System</h4>
      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VotingSystemSelector;
