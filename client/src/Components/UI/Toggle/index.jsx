const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-7 w-18 md:h-6 md:w-11 items-center rounded-full transition-colors duration-200 ${
      value ? 'bg-c-zinc' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
        value ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export default Toggle