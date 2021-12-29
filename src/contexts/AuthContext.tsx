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
  linkWithPopup,
  signInWithCredential,
  signInWithRedirect,
  linkWithRedirect,
} from "@firebase/auth";

import { db } from "lib/firebaseConfig";
import { ref as fbRef, set as fbSet } from "firebase/database";
import { initialRoutines } from "models/initialData";

import { cloneDeep } from "lodash";
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
    getRedirectResult(auth)
      .then((result) => {
        console.log("Success getRedirectResult");
        console.log(result);
      })
      .catch((error) => {
        console.error("Error getRedirectResult");
        console.log({ error });

        // 既に存在するユーザな場合は、signInWithCredential でログインする。
        if (error?.code === "auth/credential-already-in-use") {
          console.log("auth/credential-already-in-use: signInWithCredential");
          const credential = GoogleAuthProvider.credentialFromError(error);
          if (credential == null) {
            console.error("credential is null");
            throw error;
          }
          signInWithCredential(auth, credential).then((result) => {
            console.log("Success signInWithCredential");
            console.log(result);
          });
        } else {
          throw error;
        }
      });

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
