import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateInput = ({
  label_text,
  value,
  onChange,
  placeholder = "",
  isDisabled = false,
  Icon,
  className = "",
  maxDate,
  minDate,
  dateFormat = "MMM dd, yyyy"
}) => {
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
        <DatePicker
          selected={value}
          onChange={onChange}
          placeholderText={placeholder}
          disabled={isDisabled}
          maxDate={maxDate}
          minDate={minDate}
          dateFormat={dateFormat}
          className={`
            w-full px-3 py-2 rounded-md bg-white text-gray-800 placeholder-gray-400 
            outline-none border-2 focus:border-gray-300 transition-all
            ${Icon ? "pl-10" : ""}
            ${isDisabled ? "bg-gray-100 cursor-not-allowed" : ""}
            border-gray-200
            ${className}
          `}
        />
      </div>
    </div>
  );
};

export default DateInput;
