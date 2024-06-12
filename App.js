import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {initializeApp} from 'firebase/app';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import AuthScreen from './Components/AuthScreen';
import AuthenticatedScreen from './Components/AuthenticatedScreen';

// Initialize Firebase only once
const firebaseConfig = {
  apiKey: 'AIzaSyDfe6QXupFT6hIL-JBel5gjG78bu4oyVS0',
  authDomain: 'mediaapp-97e71.firebaseapp.com',
  projectId: 'mediaapp-97e71',
  storageBucket: 'mediaapp-97e71.appspot.com',
  messagingSenderId: '695534051315',
  appId: '1:695534051315:web:0e644224933050be2dfc86',
};
const app = initializeApp(firebaseConfig);

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setShowAuthScreen(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully!');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {showAuthScreen ? (
        user ? (
          <AuthenticatedScreen user={user} handleLogout={handleLogout} />
        ) : (
          <AuthScreen
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            handleAuthentication={handleAuthentication}
          />
        )
      ) : (
        <View style={styles.mainContainer}>
          <Text style={styles.welcomeText}>Welcome to the Media App</Text>
          <Button
            title="Login"
            onPress={() => setShowAuthScreen(true)}
            color="#3498db"
          />
          
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
    color: 'black',
  },
});

export default App;
