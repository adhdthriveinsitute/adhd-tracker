const ReadOnlyInput = ({ text, label_text, Icon = null, className = "" }) => {
  return (
    <div className="mb-4">
      {label_text && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label_text}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        )}
        <div
          className={`w-full px-3 py-2 rounded-md bg-white text-gray-800 
            outline-none border-2 transition-all cursor-not-allowed
            ${Icon ? "pl-10" : ""}
            border-gray-200
            ${className}`}
        >
          {text || "-"}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyInput;
