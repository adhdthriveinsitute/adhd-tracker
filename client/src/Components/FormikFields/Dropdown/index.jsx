import { Field } from "formik";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({
    field,
    label_text,
    options,
    placeholder = "Select a value",
    className = "",
    disableFormik = false,
    value,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);


    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (disableFormik) {
        return (
            <div
                ref={dropdownRef}
                className="relative w-full">
                {label_text && (
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        {label_text}
                    </label>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex justify-between items-center select-field ${className}`}
                >
                    {value
                        ? options.find(opt => opt.value === value)?.label
                        : placeholder}
                    <ChevronDown className={`ml-2 w-5 h-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                {isOpen && (
                    <ul className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {options.map(option => (
                            <li
                                key={option.value}
                                className={`px-4 py-3 cursor-pointer transition-all 
            ${value === option.value ? "bg-c-zinc/80 font-semibold text-white" : "hover:bg-gray-100"}`}
                                onClick={() => {
                                    onChange?.(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        );
    }



    return (
        <div
            ref={dropdownRef}
            className="mb-4 relative w-full ">
            {label_text && (
                <label htmlFor={field} className="block mb-1 text-sm font-medium text-gray-700">
                    {label_text}
                </label>
            )}

            <Field name={field}>
                {({ field: formikField, form, meta }) => {
                    const selected = formikField.value;
                    const setSelected = (value) => form.setFieldValue(field, value);
                    const error = meta.touched && meta.error;
                    const success = meta.touched && !meta.error;

                    return (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-full flex justify-between items-center bg-white rounded-md px-4 py-2 text-gray-700 shadow-sm transition-all
                  outline-none border-2 
                  ${error ? "border-red-400" : "border-gray-200"} 
                  ${success ? "border-green-400" : ""}
                  ${className}`}
                            >
                                {selected
                                    ? options.find(opt => opt.value === selected)?.label
                                    : placeholder}
                                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                            </button>

                            {isOpen && (
                                <ul className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                    {options.map(option => (
                                        <li
                                            key={option.value}
                                            className={`px-4 py-3 cursor-pointer transition-all 
                        ${selected === option.value ? "bg-c-zinc/80 font-semibold text-white" : "hover:bg-gray-100"}`}
                                            onClick={() => {
                                                setSelected(option.value);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {error && <p className="error-message">{meta.error}</p>}
                            {/* {success && <p className="success-message">Looks good!</p>} */}
                        </>
                    );
                }}
            </Field>
        </div>
    );
};

export default Dropdown;
