// components/UserMenu.jsx
const UserMenu = ({ onSelect }) => {
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
        className="w-full px-4 py-2 text-left hover:bg-slate-100 rounded-b-xl"
      >
        Liked
      </button>
    </div>
  );
};

export default UserMenu;
