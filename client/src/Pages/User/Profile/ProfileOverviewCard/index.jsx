import { useState, useEffect } from "react"
import { Pencil, UserRound, Clock, Shield } from "lucide-react"
import { motion } from "framer-motion"
import ReadOnlyProfileInfo from "./ReadOnlyProfileInfo"
import ProfileEditingPopup from "./ProfileEditingPopup"
import { formatDistanceToNow } from "date-fns"

const ProfileOverviewCard = ({ profile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [initialValues, setInitialValues] = useState(profile)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setInitialValues(profile)
  }, [profile])

  const handleEditToggle = () => setIsEditing(!isEditing)

  // Format the last updated date to be human-readable
  const formattedLastUpdated = () => {
    try {
      const date = new Date(initialValues.lastUpdated)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return initialValues.lastUpdated
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative rounded-3xl bg-gray-100 md:max-w-3xl md:mx-auto my-12 overflow-x-hidden"
      >
     
        <div className="relative py-6 px-3 md:px-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-inner border border-gray-300"
                >
                  <UserRound size={24} className="text-gray-700" strokeWidth={1.5} />
                </motion.div>

                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500  rounded-full border-2 border-white shadow-sm" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-800 tracking-tight">
                    Profile Overview
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>

                <div className="flex items-center mt-1 text-xs text-neutral-500">
                  <Clock size={12} className="mr-1" />
                  <span>Updated {formattedLastUpdated()}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white text-neutral-500 hover:text-primary-600  shadow-sm border border-neutral-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-c-zinc focus-visible:ring-offset-2"
              onClick={handleEditToggle}
              aria-label="Edit profile"
            >
              <Pencil size={18} />

              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-neutral-800  text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Edit Profile
              </span>
            </motion.button>
          </div>

          <div className="relative">
            <motion.div
              animate={{
                boxShadow: isHovered ? "0 4px 20px -4px rgba(0,0,0,0.15)" : "0 2px 10px -4px rgba(0,0,0,0.1)",
              }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl bg-white /50 p-5 border border-neutral-100/50"
            >
              <div className="absolute top-0 left-0 w-full h-1  to-primary-600/80 rounded-t-lg opacity-80" />

              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-gray-700" />
                <h3 className="text-sm font-medium text-neutral-700">Personal Information</h3>
              </div>

              <ReadOnlyProfileInfo
                profile={initialValues} />
            </motion.div>
          </div>

        </div>
      </motion.div>

      {isEditing && (
        <ProfileEditingPopup
          profile={initialValues}
          onClose={handleEditToggle}
        />
      )}
    </>
  )
}

export default ProfileOverviewCard
