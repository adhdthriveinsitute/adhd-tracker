import ReadOnlyInput from "@src/Components/UI/ReadOnlyInput"
import { WEIGHT_UNIT } from "@src/constants"

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
                label_text={`Weight in ${WEIGHT_UNIT}`}
                text={profile.weight} />
            <ReadOnlyInput
                label_text="Gender"
                text={profile.gender} />
            <ReadOnlyInput
                label_text="Client of ADHD Thrive Institute"
                text={profile.type === "client" ? "Yes"
                    : profile.type === "non-client" ? "No" : null} />
            <ReadOnlyInput
                label_text={`Change password`}
                text={"●●●●●●●●"} />
            <ReadOnlyInput
                label_text={`Confirm change password`}
                text={"●●●●●●●●"} />
        </div>
    )
}

export default ReadOnlyProfileInfo