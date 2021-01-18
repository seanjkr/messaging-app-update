import React, {Component} from 'react';
import PropTypes from 'prop-types';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const firebase = require('firebase');
import 'firebase/firestore';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default class CustomActions extends Component {
  constructor() {
    super()
  }

  chooseImage = async () => {
    try {
      const {status} = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

      if(status === 'granted'){
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images'
        }).catch(error => console.log(error));

        if (!result.cancelled){
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({image: imageUrl});
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  takePicture = async () =>{
    try {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY, Permissions.CAMERA);
    
      if(status === 'granted'){
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images'
        }).catch(error => console.log(error));

        if (!result.cancelled){
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({image: imageUrl});
        }
      }
    } catch(error) {
      console.log(error);
    }
  }

  uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const imageUri = uri.split('/');
      const imageName = imageUri[imageUri.length -1];
      const ref = firebase.storage().ref().child(`images/ ${imageName}`);
      const snapshot = await ref.put(blob);
      const imageUrl = await snapshot.ref.getDownloadURL();
      return imageUrl;
    } catch(error) {
      console.log(error);
    }
  }

  getLocation = async () => {
    try {
      const {status} = await Permissions.askAsync(Permissions.LOCATION);

      if(status === 'granted') {
        let result = await Location.getCurrentPositionAsync({}).catch(error => console.log(error));
        if(result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude
            }
          });
        }
      }
    } catch(error) {
      console.log(error);
    }
  }

  onActionPress = () => {
    const options = [ 'Choose Picture', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    this.context.actionSheet().showActionSheetWithOptions(
      {options, cancelButtonIndex}, async(buttonIndex) => {
        switch(buttonIndex) {
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
    return(
      <TouchableOpacity style= {[styles.container]} onPress={this.onActionPress}>

        <View style={[styles.wrapper, this.props.wrapperStyle]}>

          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>

        </View>

      </TouchableOpacity>
    );
  }
}

const styles= StyleSheet.create({

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