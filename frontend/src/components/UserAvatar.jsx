// components/UserAvatar.jsx
import { useEffect, useState } from "react";
import { fetchMe } from "@/api/user";
import UserMenu from "./UserMenu";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = ({ onOpenModal }) => {
  const [initials, setInitials] = useState("?");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMe().then((user) => {
      setInitials(getInitials(user.name));
    });
  }, []);

  return (
    <div
      className="relative"
      onClick={() => setOpen((prev) => !prev)}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-slate-900 flex items-center justify-center text-white font-medium text-sm shadow-md cursor-pointer">
        {initials}
      </div>

      {open && <UserMenu onSelect={onOpenModal} />}
    </div>
  );
};

export default UserAvatar;
