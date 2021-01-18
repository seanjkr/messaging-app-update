import React, { Component } from 'react';

import {
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import MapView from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomActions from './CustomActions';

const firebase = require('firebase');
require('firebase/firestore');

export default class ChatScreen extends Component {
  constructor() {
    super();

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyBTQzEHNtalzsYEdm77StAmnvL0yUKiXoE',
        authDomain: 'messaging-app-f3d58.firebaseapp.com',
        projectId: 'messaging-app-f3d58',
        storageBucket: 'messaging-app-f3d58.appspot.com',
        messagingSenderId: '942971714948',
        appId: '1:942971714948:web:3d0e8c621a1235104bb1d1',
        measurementId: 'G-6DTWRGLM0P',
      });
    }
    this.referenceMessages = firebase.firestore().collection('messages');

    this.state = {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      color: '',
      isConnected: true,
    };
  }

  componentDidMount() {
    let { name, color } = this.props.route.params;
    if (!name || name === '') name = 'new-user';
    this.props.navigation.setOptions({ title: `Chat: ${name}` });

    this.setState({
      color,
    });

    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({
          isConnected: true,
        });
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
              console.log(user);
            } catch (error) {
              console.log('unable to sign in!');
            }
          }

          this.setState({
            user: {
              _id: user.uid,
              name,
              avatar: 'https://placeimg.com/140/140/any',
            },
          });
          this.unsubscribe = this.referenceMessages
            .orderBy('createdAt', 'desc')
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

  /**
   * Called when messages sent - appends state of gifted-chat and calls 'addMessages()' and
   * 'saveMessages()' to update firestore and async-storage
   * @param {object} message
   */

  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessage();
      this.saveMessages();
    });
  }

  /**
   * Called when user is offline - retrieves messages from local async storage via
   * 'AsyncStorage.getItem()' then updates state.
   * @async
   */

  async getMessagesOffline() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Called on componentDidMount and when an update to firebase is detected, iterates over messages
   * from firebase and updates state. Then uses 'saveMessages()' to update async-storage.
   * @params querySnapshot
   */

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
        },
      });
    });
    this.setState({
      messages,
    });
    this.saveMessages();
  }

  /**
   * Saves messages to async-storage, called from 'onSend()' and 'onCollectionUpdate()'
   * @async
   */

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Adds message to google-firestore via 'referenceMessages.add()' - called from 'onSend()'
   * @function
   */

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
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#839192',
          },
          left: {
            backgroundColor: '#45b390',
          },
        }}
      />
    );
  }

  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return (
        <InputToolbar {...props} />
      );
    }
  }

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
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

      <View style={{ flex: 1, backgroundColor: this.state.color }}>

        {/* fix for keyboard spacing on android */}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }

        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.state.user}
        />

      </View>
    );
  }
}
