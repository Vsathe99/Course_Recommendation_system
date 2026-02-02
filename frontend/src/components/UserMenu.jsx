// components/UserMenu.jsx
import { logoutUser } from "../api/user";

const UserMenu = ({ onSelect, onLogout }) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      onLogout(); // parent handles cleanup + redirect
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
      <button
        onClick={() => onSelect("saved")}
        className="w-full px-4 py-2 text-left hover:bg-slate-100 rounded-t-xl"
      >
        Saved
      </button>

      <button
        onClick={() => onSelect("liked")}
        className="w-full px-4 py-2 text-left hover:bg-slate-100"
      >
        Liked
      </button>

      <button
        onClick={handleLogout}
        className="
          w-full px-4 py-2 text-left
          text-green-600
          hover:bg-green-600
          hover:text-white
          transition-colors duration-200
          rounded-b-xl
        "
      >
        Logout
      </button>
    </div>
  );
};

export default UserMenu;
