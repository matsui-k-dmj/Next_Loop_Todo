import {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "lib/firebaseConfig";
import { onAuthStateChanged, signInAnonymously, User } from "@firebase/auth";

import { db } from "lib/firebaseConfig";
import { ref as fbRef, set as fbSet } from "firebase/database";
import { initialRoutines } from "models/initialData";

interface AuthValue {
  currentUser: User | null;
}

const AuthContext = createContext({} as AuthValue); // 初期値はAuthProviderで直ぐに入れるのでasでも大丈夫

function initilizeData(uid: string) {
  fbSet(fbRef(db, `users/${uid}/routines`), initialRoutines);
}

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
          .then((userCredential) => {
            console.log("signInAnonymously");
            initilizeData(userCredential.user.uid);
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
