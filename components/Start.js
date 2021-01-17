import React, { Component } from 'react';

import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Card } from 'react-native-elements';


export default class StartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      color: '#E5E5E5' //default grey color for chat
    };
  }
  
  render() {

    return (

      //fix to issues with keyboard covering textInput
      <KeyboardAvoidingView behavior="height" style={{flex: 1 }}>

        <ImageBackground source={require('../assets/Background-Image.png')} style={styles.container}>

          <View style={{ flex: 55, alignItems: 'center' }}>

            <Text style={styles.title}> Messenging Genius </Text>

          </View>

          <View style={{flex: 45 }}>

            <Card style={{height: '100%' }}>

              <TextInput
                style={styles.nameInput}
                onChangeText={(name) => this.setState({name})}
                value={this.state.name}
                placeholder='Enter name...'
              />

              <Text style={{marginTop: 40, fontSize: 16 }}> Choose background color: </Text>

              <View style={styles.colorSelection}>

                <TouchableOpacity 
                  style={[styles.colorSelector, { backgroundColor: '#000'}]}
                  onPress={() => this.setState({ color: '#000'})}
                />

                <TouchableOpacity 
                  style={[styles.colorSelector, { backgroundColor: '#14323D'}]}
                  onPress={() => this.setState({ color: '#14323D'})}
                />

                <TouchableOpacity 
                  style={[styles.colorSelector, { backgroundColor: '#B9C6AE'}]}
                  onPress={() => this.setState({ color: '#B9C6AE'})}
                />

                <TouchableOpacity 
                  style={[styles.colorSelector, { backgroundColor: '#E5E5E5'}]}
                  onPress={() => this.setState({ color: '#E5E5E5'})}
                />

              </View>

              <TouchableOpacity 
                onPress={() => this.props.navigation.navigate('ChatScreen', { name: this.state.name, color: this.state.color })}
                style={styles.enterButton}
              >

                <Text style={styles.enterButtonText}> 

                  Enter Chat!

                </Text>

              </TouchableOpacity>

            </Card>

          </View> 

        </ImageBackground>

      </KeyboardAvoidingView>

    )
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center', 
    width: '100%'
  },

  title: {
    marginTop: '50%', 
    color: '#ffffff', 
    fontSize: 40, 
    fontWeight: '600' 
  },

  nameInput: {
    height: 40, 
    borderColor: '#14213D', 
    borderWidth: 1
  },

  colorSelection: {
    flex: 4, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginTop: 10, 
    marginBottom: 30
  },

  colorSelector: {
    height: 45,
    width: 45,
    borderRadius: 70,
    margin: 20
  },

  enterButton: {
    elevation: 8, 
    backgroundColor: '#14213D', 
    padding: 14, 
    marginTop: 75 
  },

  enterButtonText: {
    fontSize: 18, 
    color: '#fff', 
    fontWeight: 'bold', 
    alignSelf: 'center'
  }
})