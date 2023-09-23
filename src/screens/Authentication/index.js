import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {_signInWithGoogle} from '../../config/auth';

export default function AuthenticationScreen() {
  async function onFacebookButtonPress() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      console.log('data=>', data);
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    // Sign-in the user with the credential
    return auth().signInWithCredential(facebookCredential);
  }

  async function _signInWithFaceBook() {
    let cred = await onFacebookButtonPress();
    console.log('cred=>', cred);
  }

  async function signInWithGoogle() {
    _signInWithGoogle().then(data => {
      console.log('user data=>', data);
    });
  }

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity onPress={() => _signInWithFaceBook()}>
        <Text
          style={{
            color: 'white',
            backgroundColor: 'blue',
            padding: 8,
          }}>
          SignIn With FaceBook
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => signInWithGoogle()}>
        <Text
          style={{
            color: 'white',
            backgroundColor: 'green',
            padding: 8,
            marginTop: 10,
          }}>
          SignIn With Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
