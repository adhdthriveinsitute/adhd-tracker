import { useSelector } from 'react-redux'
import ProfileOverviewCard from './ProfileOverviewCard'

function Profile() {

    const user = useSelector(state => state.user)

    const profileData = {
        name: user.name,
        email: user.email,
        lastUpdated: user.updatedAt,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        weight: user.weight,
        type: user.type
    }


    return (
        <ProfileOverviewCard
            profile={profileData}
        />
    )
}

export default Profile