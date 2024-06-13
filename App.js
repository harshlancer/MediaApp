import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import AuthScreen from './components/AuthScreen';
import AuthenticatedScreen from './components/AuthenticatedScreen';
import { Camera, CameraType } from 'react-native-camera-kit';
import RNFS from 'react-native-fs';

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
  const [showCamera, setShowCamera] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);
  const cameraRef = useRef(null);

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

  const handleCapture = async () => {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.capture();
      console.log('Captured photo URI:', uri);
      setCapturedUri(uri);
    }
  };

  const handleSave = async () => {
    if (capturedUri && capturedUri.startsWith('file://')) {
      const pathSplitter = '/';
      const filePath = capturedUri.replace('file://', '');
      const pathSegments = filePath.split(pathSplitter);
      const fileName = pathSegments[pathSegments.length - 1];
      const destFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      try {
        await RNFS.moveFile(filePath, destFilePath);
        console.log('File moved to:', `file://${destFilePath}`);
        setCapturedUri(null); // Clear the preview after saving
        setShowCamera(false); // Go back to the main screen
      } catch (error) {
        console.error('File move error:', error.message);
      }
    }
  };

  const handleCancel = () => {
    setCapturedUri(null);
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
        !showCamera ? (
          <View style={styles.mainContainer}>
            <Text style={styles.welcomeText}>Welcome to the Media App</Text>
            <Button
              title="Login"
              onPress={() => setShowAuthScreen(true)}
              color="#3498db"
            />
            <Button
              title="Camera"
              onPress={() => setShowCamera(true)}
              color="#e74c3c"
            />
          </View>
        ) : (
          capturedUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedUri }} style={styles.previewImage} />
              <View style={styles.buttonContainer}>
                <Button title="Save" onPress={handleSave} color="#27ae60" />
                <Button title="Retake" onPress={handleCancel} color="#e74c3c" />
              </View>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <Camera
                ref={cameraRef}
                cameraType={CameraType.Back} // front/back(default)
                flashMode="auto"
                style={styles.camera}
              />
              <View style={styles.buttonContainer}>
                <Button title="Capture" onPress={handleCapture} color="#27ae60" />
                <Button title="Back" onPress={() => setShowCamera(false)} color="#3498db" />
              </View>
            </View>
          )
        )
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
  cameraContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'black',
  },
  previewImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default App;
