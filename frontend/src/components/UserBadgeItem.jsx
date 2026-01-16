// This component renders a small "Tag" or "Badge" for a selected user (like in the "To:" field of an email).
// It is used when creating a group to show who you have selected.
export const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div
      onClick={handleFunction}
      className="inline-flex items-center px-3 py-1 m-1 mb-2 rounded-lg text-xs font-bold bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors"
    >
      {user.name}
      
      {/* Logic for showing Admin tag */}
      {(admin === user._id || admin?._id === user._id) && (
        <span className="ml-1 text-[10px] opacity-80">(Admin)</span>
      )}
      
      {/* Custom Close Icon (SVG) */}
      <svg 
        className="w-2.5 h-2.5 ml-2 mt-0.5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
};