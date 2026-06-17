import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetLanguageQuery } from "../features/Languageapi";
import { setLanguage } from "../features/Languageselectionslice";

// Mount once near the root of your app, inside <Provider> and <PersistGate>.
// It loads the saved backend language for the logged-in user and writes it to Redux,
// so every screen using useT() changes automatically.
export default function LanguageBootstrap() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);

  const { data } = useGetLanguageQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data?.language) {
      dispatch(setLanguage(data.language));
    }
  }, [data?.language, dispatch]);

  return null;
}
