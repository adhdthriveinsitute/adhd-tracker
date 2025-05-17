import { Formik, Form } from "formik";
import TextField from "@src/Components/FormikFields/TextField";
import * as yup from "yup";
import { Axios } from "@src/api";
import { DATE_FORMAT_REGEX, DATE_FORMAT_STRING, GENDERS, WEIGHT_UNIT } from "@src/constants";
import { ErrorNotification, formatDateOfBirthInput, SuccessNotification, updateAuthUser } from "@src/utils";
import { useState } from "react";
import BasePopup from "@src/Components/UI/BasePopup";
import { BiLoaderAlt } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "@src/redux/slices/userSlice";
import Dropdown from "@src/Components/FormikFields/Dropdown";
import { format, isValid, parse } from "date-fns";

const ProfileEditingPopup = ({ profile, onClose }) => {
    const [loading, setLoading] = useState(false);
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()

    const validationSchema = yup.object({
        name: yup
            .string()
            .min(3, "Come on don't be shy"),
        email: yup
            .string()
            .email('Invalid email')
            .required('Required'),
        weight: yup
            .number()
            .typeError("Only numeric values allowed")
            .max(500, "Hmmmm....Are you sure?"),
        dateOfBirth: yup
            .string()
            .required("Required")
            .matches(DATE_FORMAT_REGEX, "Invalid date format. Please use MM-DD-YYYY")
            .test("is-valid-date", "Invalid date", (value) => {
                if (!value) return false;
                const parsedDate = parse(value, DATE_FORMAT_STRING, new Date());
                // Check parsed date is valid and exact match to input
                return (
                    isValid(parsedDate) &&
                    format(parsedDate, DATE_FORMAT_STRING) === value
                );
            })
            .test("age-limit", "Date must be between 1900 and today", (value) => {
                if (!value) return false;
                const date = parse(value, DATE_FORMAT_STRING, new Date());
                const year = date.getFullYear();
                const today = new Date();
                return year >= 1900 && date <= today;
            })
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                name: values.name,
                email: values.email,
                dateOfBirth: values.dateOfBirth,
                weight: values.weight,
                gender: values.gender,
                type: values.type
            }
            // console.log("Payload", payload);
            // return
            const response = await Axios.put("/users/profile", payload,
                {
                    params: {
                        userId: user?._id,
                    }
                });
            SuccessNotification("Profile Updated Successfully")
            const updatedUser = response.data.user
            updateAuthUser("user", updatedUser)
            dispatch(updateUserInfo(updatedUser));
        } catch (error) {
            ErrorNotification(error?.response?.data?.error || 'Failed to update user profile.');
            throw error.response ? error : new Error("Unexpected error while updating user profile");
        } finally {
            setLoading(false);
            onClose();
        }
    };


    return (
        <BasePopup
            title="Edit Profile"
            onClose={onClose} show={true}>
            <Formik
                initialValues={profile}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                                field="name"
                                label_text="Name"
                                placeholder="Enter your name"
                                isDisabled={false}
                                onChange={(e) =>
                                    setFieldValue("name", e.target.value)
                                }
                            />
                            <TextField
                                field="email"
                                label_text="Email"
                                placeholder="Enter your email"
                                isDisabled={false}
                                onChange={(e) =>
                                    setFieldValue("email", e.target.value)
                                }
                            />

                            <TextField
                                field="dateOfBirth"
                                label_text="Date of Birth"
                                placeholder={DATE_FORMAT_STRING}
                                maxLength={10}
                                onChange={(e) => {
                                    const formatted = formatDateOfBirthInput(e.target.value);
                                    setFieldValue('dateOfBirth', formatted);
                                    return formatted;
                                }}

                            />

                            <TextField
                                field="weight"
                                label_text={`Weight in ${WEIGHT_UNIT}`}
                                type="number"
                                placeholder="Enter weight"
                                isDisabled={false}
                                onChange={(e) =>
                                    setFieldValue("weight", e.target.value)
                                }
                            />

                            {/* <TextField
                                field="gender"
                                label_text="Gender"
                                placeholder="Gender"
                                /> */}

                            <Dropdown
                                field="gender"
                                label_text="Gender"
                                options={GENDERS.map(g => ({ label: g, value: g }))}
                                placeholder="Select gender"
                            />


                            <Dropdown
                                field="type"
                                label_text={`Client of "ADHD Thrive Institute"?`}
                                options={[
                                    { label: "Yes", value: "client" },
                                    { label: "No", value: "non-client" }
                                ]}
                                placeholder={"No"}
                            />


                        </div>

                        <div className="flex justify-end mt-6 gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="!px-4 !py-2 !text-sm btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="!px-4 !py-2 !text-sm btn-primary"
                            >
                                {loading ? (
                                    <BiLoaderAlt className="animate-spin text-2xl mx-auto" />
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </BasePopup>
    );


};

export default ProfileEditingPopup;
