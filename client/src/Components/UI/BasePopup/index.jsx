import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { popupAnimation } from "@src/utils"

const BasePopup = ({ title, onClose, children, show = false }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1919a7] bg-opacity-40 backdrop-blur-sm px-4 min-h-[100vh]"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            variants={popupAnimation}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition bg-gray-200 w-7 h-7 rounded-full flex justify-center items-center cursor-pointer"
              aria-label="Close popup"
            >
              <X
               className="w-4 h-4" />
            </button>
            {title && (
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {title}
              </h2>
            )}
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BasePopup;
