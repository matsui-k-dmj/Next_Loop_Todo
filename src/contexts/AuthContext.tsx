import {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "lib/firebaseConfig";
import { onAuthStateChanged, signInAnonymously, User } from "@firebase/auth";

interface AuthValue {
  currentUser: User | null;
}

const AuthContext = createContext({} as AuthValue); // 初期値はAuthProviderで直ぐに入れるのでasでも大丈夫

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /**
   * urlを直接打ってアクセスした場合は、userを取りに行くまで時間がかかるが、
   * その間にアプリを描画してしまうと必ずリダイレクトされるので、
   * それを待つための変数
   */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is set!");
        console.log({ user });
        setCurrentUser(user);
      } else {
        console.log("No User!");
        signInAnonymously(auth)
          .then(() => {
            console.log("signInAnonymously");
          })
          .catch((error) => {
            console.error("signInAnonymously");
            console.error({ error });
          });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
