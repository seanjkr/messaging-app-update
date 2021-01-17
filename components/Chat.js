import React, { Component } from 'react';

import { View, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import MapView from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebase = require('firebase');
require('firebase/firestore');

import CustomActions from './CustomActions';

export default class ChatScreen extends Component {

  constructor() {
    super();

    if(!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyBTQzEHNtalzsYEdm77StAmnvL0yUKiXoE",
        authDomain: "messaging-app-f3d58.firebaseapp.com",
        projectId: "messaging-app-f3d58",
        storageBucket: "messaging-app-f3d58.appspot.com",
        messagingSenderId: "942971714948",
        appId: "1:942971714948:web:3d0e8c621a1235104bb1d1",
        measurementId: "G-6DTWRGLM0P"
      });
    }
    //set up 'referenceMessages' to get messages from collection
    this.referenceMessages = firebase.firestore().collection('messages');

    this.state= {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
      color: '',
      isConnected: true,
      loggedInText: 'Logging in...',
    };
  }

  //saves messages to asyncStorage - called from 'onSend' below
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    }catch(error) {
      console.log(error.message);
    }
  }

  //gets messages to render in gifted-chat
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || '',
        image: data.image || '',
        location: data.location || null,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
        }
      });
    });
    this.setState({
      messages,
    });
    this.saveMessages();
  }

  async getMessagesOffline() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //uses 'referenceMessages' to send new messages to firestore, called from 'onSend' below
  addMessage() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || '',
      image: message.image || '',
      location: message.location || null,
      createdAt: message.createdAt,
      user: this.state.user,
      sent: true,
    });
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: [],
      })
    } catch(error) {
      console.log(error.message);
    }
  }

  //updates ui when message sent and uses 'addMessage' to send to firestore, and 'saveMessages' to save locally
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessage();
      this.saveMessages();
    });
  }

  componentDidMount() {
    // get name and color passed in route params from login
    let { name, color } = this.props.route.params;
    if ( !name || name === '') name = 'new-user';
    this.props.navigation.setOptions({ title: `Chat: ${name}` });

    this.setState({
      color: color,
    })

    //checks if user is online
    NetInfo.fetch().then(connection => {

      //if online - retrieve data from firestore
      if(connection.isConnected) {
        this.setState({
          isConnected: true,
        });
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if(!user) {
            try {
              await firebase.auth().signInAnonymously();
              console.log(user);
            } catch(error) {
              console.log( 'unable to sign in!')
            }
          }

          this.setState({
            user: {
              _id: user.uid,
              name: name,
              avatar: 'https://placeimg.com/140/140/any'
            },
            loggedInText: `${name} has entered the chat` 
          });

          //get the messages from firestore using 'referenceMessages'
          this.unsubscribe = this.referenceMessages
            .orderBy("createdAt" , "desc" )
            //use 'onCollectionUpdate' to add messages to get messages to render
            .onSnapshot(this.onCollectionUpdate);
        });

      } else {
        this.setState({
          isConnected: false,
        });
        this.getMessagesOffline();
      }
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  //changes style and color of message bubbles
  renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#839192'
          },
          left: {
            backgroundColor: '#45b390'
          }
        }}
      />
    )
  }

  //renders input in gifted-chat or doesn't if user is offline
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar {...props} />
      );
    }
  }

  //renders plus button that opens <CustomActions> window
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  //renders custom view for map and location services
  renderCustomView(props) {
    const {currentMessage} = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {

    return (

      <View style={{flex: 1, backgroundColor: this.state.color }}>

        {/* fix for keyboard spacing on android */}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }

        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />

      </View>
    );
  }
}