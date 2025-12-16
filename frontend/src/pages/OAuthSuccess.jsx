import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAccessToken } from "../store/authSlice";
import { setUser } from "../store/userSlice";
import { fetchMe } from "../api/user";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) return navigate("/login");

    dispatch(setAccessToken(token));

    fetchMe().then((user) => {
      dispatch(setUser(user));
      navigate("/chat");
    });
  }, []);

  return <p>Signing you in...</p>;
};

export default OAuthSuccess;
