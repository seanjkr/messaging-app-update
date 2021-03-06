import React, { Component } from 'react';
import PropTypes from 'prop-types';

import 'firebase/firestore';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const firebase = require('firebase');

export default class CustomActions extends Component {
  /**
   * Asks user permission to access media-library, then if granted, opens library, allows
   * user to choose picture, saves it to google-firestore via 'uploadImage()' and returns
   * url string to be passed to image property of 'onSend()' function.
   * @async
   * @returns {Promise<string>} Url of image from google-firestore
   */
  chooseImage = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Asks user permission to use camera, then if granted, opens camera, allows
   * user to take picture, saves it to google-firestore via 'uploadImage()'
   * and returns url string to be passed to image property of 'onSend()' function.
   * @async
   * @returns {Promise<string>} Url of image from google-firestore
   */

  takePicture = async () => {
    try {
      const { status } = await Permissions.askAsync(
        Permissions.MEDIA_LIBRARY,
        Permissions.CAMERA,
      );
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Converts image uri to blob, extracts image name from uri, saves to google-firestore,
   * then returns url to use for onSend() function.
   * @async
   * @param {string} uri
   * @return {string} imageUrl
   */

  uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageUri = uri.split('/');
      const imageName = imageUri[imageUri.length - 1];
      const ref = firebase.storage().ref().child(`images/ ${imageName}`);
      const snapshot = await ref.put(blob);
      const imageUrl = await snapshot.ref.getDownloadURL();
      return imageUrl;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Asks user permission to use location data, then when granted returns object containing location
   * latitude and longitude to be passed to location prop for onSend() function.
   * @async
   * @return {object} location
   */

  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);

      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({
        }).catch((error) => console.log(error));
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  onActionPress = () => {
    const options = ['Choose Picture', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    this.context.actionSheet().showActionSheetWithOptions(
      { options, cancelButtonIndex }, async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.chooseImage();
            return;
          case 1:
            this.takePicture();
            return;
          case 2:
            this.getLocation();
            return;
          default:
        }
      },
    );
  };

  render() {
    return (
      <TouchableOpacity style={[styles.container]} onPress={this.onActionPress}>

        <View style={[styles.wrapper, this.props.wrapperStyle]}>

          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>

        </View>

      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({

  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },

  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },

  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
