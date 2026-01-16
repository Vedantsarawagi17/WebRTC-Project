// The objective of UserListItem is to provide a standardized, clickable UI component for displaying a single user summary
export const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center w-full px-3 py-2 mb-2 bg-[#E8E8E8] hover:bg-[#38B2AC] hover:text-white text-black cursor-pointer rounded-lg transition-all duration-200 ease-in-out shadow-sm"
    >
      {/* Avatar Section */}
      <div className="mr-3 shrink-0">
        {user.pic ? (
          <img
            src={user.pic}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        ) : (
          /* Fallback Initials if no picture exists */
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>

      {/* User Info Section */}
      <div className="flex flex-col overflow-hidden">
        <p className="font-semibold text-sm truncate uppercase tracking-wide">
          {user.name}
        </p>
        <p className="text-xs truncate">
          <span className="font-bold opacity-80">Email: </span>
          {user.email}
        </p>
      </div>
    </div>
  );
};