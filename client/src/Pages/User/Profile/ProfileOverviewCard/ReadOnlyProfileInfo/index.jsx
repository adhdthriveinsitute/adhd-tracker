import ReadOnlyInput from "@src/Components/UI/ReadOnlyInput"

function ReadOnlyProfileInfo({ profile }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyInput
                label_text="Name"
                text={profile.name} />
            <ReadOnlyInput
                label_text="Email"
                text={profile.email} />
            <ReadOnlyInput
                label_text="Date of Birth"
                text={profile.dateOfBirth} />
            <ReadOnlyInput
                label_text="Weight (Kg)"
                text={profile.weight} />
            <ReadOnlyInput
                label_text="Gender"
                text={profile.gender} />
            <ReadOnlyInput
                label_text="Client of our institute"
                text={profile.type === "client" ? "Yes"
                    : profile.type === "non-client" ? "No" : null} />
        </div>
    )
}

export default ReadOnlyProfileInfo