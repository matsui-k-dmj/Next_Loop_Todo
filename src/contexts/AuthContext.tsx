import {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "lib/firebaseConfig";
import {
  onAuthStateChanged,
  signInAnonymously,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithRedirect,
} from "@firebase/auth";

import { db } from "lib/firebaseConfig";
import { ref as fbRef, set as fbSet } from "firebase/database";
import { initialRoutines } from "models/initialData";

import { getRedirectResult } from "firebase/auth";

const provider = new GoogleAuthProvider();

interface AuthValue {
  currentUser: User;
  signInWithGoogle: () => void;
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
    /* linkWithRedirect の返り値を受け取る。
      redirect じゃない場合は result が null になり、既にログインしているユーザになる。
    */
    getRedirectResult(auth).catch((error) => {
      // 既に存在するユーザな場合は、signInWithCredential でログインする。
      if (error?.code === "auth/credential-already-in-use") {
        const credential = GoogleAuthProvider.credentialFromError(error);
        if (credential == null) {
          throw error;
        }
        signInWithCredential(auth, credential);
      } else {
        throw error;
      }
    });

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        signInAnonymously(auth).then((userCredential) => {
          initilizeData(userCredential.user.uid);
        });
      }

      setLoading(false);
    });
    return unsub;
  }, []);

  function signInWithGoogle() {
    if (currentUser == null) return;
    if (!currentUser.isAnonymous) return;

    // この返り値はgetRedirectResultで受け取る。
    linkWithRedirect(currentUser, provider);
  }

  if (loading || currentUser == null) return null;

  return (
    <AuthContext.Provider value={{ currentUser, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
