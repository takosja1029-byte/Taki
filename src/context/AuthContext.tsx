import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirestoreQuotaExceeded, markFirestoreQuotaExceeded, isQuotaError } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let attemptedProfileCreation = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      attemptedProfileCreation = false;

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Listen to user profile document in Firestore
        unsubscribeProfile = onSnapshot(
          userDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              setUserProfile({ uid: currentUser.uid, ...snapshot.data() } as UserProfile);
            } else if (!attemptedProfileCreation) {
              attemptedProfileCreation = true;
              // If document does not exist yet, create it once if quota not exceeded
              const newProfile: Omit<UserProfile, 'uid'> = {
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                email: currentUser.email || '',
                createdAt: new Date().toISOString(),
              };
              setUserProfile({ uid: currentUser.uid, ...newProfile });
              if (!isFirestoreQuotaExceeded()) {
                try {
                  await setDoc(userDocRef, newProfile);
                } catch (e) {
                  if (isQuotaError(e)) markFirestoreQuotaExceeded();
                  console.warn('Failed to auto-create user profile in Firestore:', e);
                }
              }
            }
            setLoading(false);
          },
          (error) => {
            if (isQuotaError(error)) markFirestoreQuotaExceeded();
            console.warn('User profile listener notice:', error.message);
            // Fallback profile from Auth state if Firestore rules/network restrict
            setUserProfile({
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              createdAt: new Date().toISOString(),
            });
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const createdUser = userCredential.user;

    if (name) {
      await updateProfile(createdUser, { displayName: name });
    }

    const newProfile = {
      name: name || createdUser.email?.split('@')[0] || 'User',
      email: createdUser.email || '',
      createdAt: new Date().toISOString(),
    };

    // Save profile document in 'users' collection keyed by Auth UID if quota not exceeded
    if (!isFirestoreQuotaExceeded()) {
      try {
        await setDoc(doc(db, 'users', createdUser.uid), newProfile);
      } catch (e) {
        if (isQuotaError(e)) markFirestoreQuotaExceeded();
        console.warn('Failed to save new user profile to Firestore:', e);
      }
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
