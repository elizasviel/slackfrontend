interface AvatarProps {
  user: {
    username: string;
    avatarUrl?: string | null;
  } | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = ({ user, size = "md", className = "" }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const baseClasses = `${sizeClasses[size]} rounded-full ${className}`;

  if (!user) {
    return (
      <div
        className={`${baseClasses} bg-gray-100 flex items-center justify-center`}
      >
        <span className="text-gray-400">?</span>
      </div>
    );
  }

  const renderInitialAvatar = () => (
    <div
      className={`${baseClasses} bg-indigo-100 flex items-center justify-center`}
    >
      <span className="text-indigo-600 font-medium">
        {user.username.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  if (!user.avatarUrl) {
    return renderInitialAvatar();
  }

  return (
    <>
      <img
        src={user.avatarUrl}
        alt={user.username}
        className={`${baseClasses} object-cover hidden`}
        onLoad={(e) => {
          e.currentTarget.classList.remove("hidden");
          e.currentTarget.nextElementSibling?.classList.add("hidden");
        }}
      />
      {renderInitialAvatar()}
    </>
  );
};
