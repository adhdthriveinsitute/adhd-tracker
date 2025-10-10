import { Field } from "formik";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

const Dropdown = ({
    field,
    label_text,
    options,
    placeholder = "Select a value",
    className = "",
    disableFormik = false,
    value,
    onChange,
    searchable = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

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

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (!isOpen) {
            setSearchTerm("");
        }
    }, [isOpen, searchable]);

    // Filter options based on search term
    const filteredOptions = searchable && searchTerm
        ? options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;


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
                    <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {searchable && (
                            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-zinc/50 focus:border-c-zinc"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}
                        <ul className="overflow-y-auto max-h-60">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
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
                                ))
                            ) : (
                                <li className="px-4 py-3 text-gray-500 text-center">
                                    No results found
                                </li>
                            )}
                        </ul>
                    </div>
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
                                <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                    {searchable && (
                                        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-c-zinc/50 focus:border-c-zinc"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <ul className="overflow-y-auto max-h-60">
                                        {filteredOptions.length > 0 ? (
                                            filteredOptions.map(option => (
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
                                            ))
                                        ) : (
                                            <li className="px-4 py-3 text-gray-500 text-center">
                                                No results found
                                            </li>
                                        )}
                                    </ul>
                                </div>
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
