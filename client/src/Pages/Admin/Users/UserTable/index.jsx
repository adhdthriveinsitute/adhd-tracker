import { useEffect, useState } from "react";
import { getAllUsers, deleteUserById, getAllUsersWithSymptoms } from "../api";
import { ErrorNotification, exportToCSV, SuccessNotification } from "@src/utils";
import { Trash2, Edit3, Download } from "lucide-react";
import { Formik, Form } from "formik";
import TextField from "@src/Components/FormikFields/TextField";
import BasePopup from "@src/Components/UI/BasePopup";
import { BiLoaderAlt } from "react-icons/bi";
import { DATE_FORMAT_OPTIONS } from "@src/constants";

 

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    // const [usersWithSymptoms, setUsersWithSymptoms] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (err) {
            ErrorNotification("Failed to fetch users.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    // const downloadAndExportUsersInCSV = async () => {
    //     try {
    //         const users = await getAllUsersWithSymptoms();
    //         setUsersWithSymptoms(users); // optional: in case you want to display later

    //         // exportToCSV(users);


    //         return //intentionally for testing user data structure

    //         // SuccessNotification("CSV exported successfully.");
    //     } catch (err) {
    //         ErrorNotification("Failed to export users.");
    //         console.error(err);
    //     }
    // };




    const handleDelete = async (id) => {
        try {
            setIsDeleting(true)
            await deleteUserById(id);
            SuccessNotification("User deleted successfully.");
            fetchUsers();
            setShowDeleteConfirm(false);
        } catch (err) {
            ErrorNotification("Failed to delete user.");
        } finally {
            setIsDeleting(false)
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (

        <>
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <Formik initialValues={{ search: "" }}>
                        {({ values, handleChange }) => (
                            <Form className="w-full md:max-w-sm">
                                <TextField
                                    field="search"
                                    label_text="Search Users"
                                    placeholder="Start typing name or email..."
                                    onChange={(e) => {
                                        handleChange(e);
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                            </Form>
                        )}
                    </Formik>

                    <button
                        onClick={() => exportToCSV(users)}
                        className="!flex !items-center !gap-2 !text-sm btn-primary md:!px-12 justify-center">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 uppercase text-gray-500 tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Gender</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Joined At</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4">{user.name}</td>
                                            <td className="px-6 py-4">{user.gender}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                {new Date(user.createdAt).toLocaleDateString(
                                                    "en-GB",
                                                    DATE_FORMAT_OPTIONS
                                                )}
                                            </td>
                                            <td className="px-6 py-4 capitalize">{user.type}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-red-600 hover:text-red-800 transition flex justify-start items-center cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedUserId(user._id);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5 mr-2" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            <BasePopup
                title="Are you sure you want to Delete this user?"
                show={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
            >
                <div className="flex justify-center space-x-4 mt-6">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleDelete(selectedUserId)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <span>
                                <BiLoaderAlt
                                    className='text-white w-6 h-6 animate-spin inline mr-2'
                                />
                                Deleting
                            </span>
                        ) : 'Delete'}
                    </button>
                </div>
            </BasePopup>



        </>

    );
};

export default UserTable;
