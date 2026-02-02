// components/UserAvatar.jsx
import { useEffect, useState } from "react";
import { fetchMe } from "@/api/user";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = ({ onOpenModal }) => {
  const [initials, setInitials] = useState("?");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe().then((user) => {
      setInitials(getInitials(user.name));
    });
  }, []);

  const handleSelect = (type) => {
    setOpen(false);
    onOpenModal(type);
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-slate-900 flex items-center justify-center text-white font-medium text-sm shadow-md cursor-pointer"
      >
        {initials}
      </div>

      {open && (
        <div onClick={(e) => e.stopPropagation()}>
          <UserMenu
            onSelect={handleSelect}
            onLogout={handleLogout}
          />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
