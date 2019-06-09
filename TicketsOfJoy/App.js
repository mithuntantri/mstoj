/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, StatusBar} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#ffbf00"
        />
        <View style={styles.logo}>
          <View style={styles.circle1}>
          <View style={styles.circle2}>
            <View style={styles.circle3Part1}></View>
            <View style={styles.circle3Part2}>
              <View style={styles.circle3Part3}></View>
            </View>
          </View>
          </View>
          
          <View style={styles.logoLeft}>
            <View style={styles.logoLine}>
              <Text style={styles.tickets}>TICKETS</Text>
            </View>
            <View style={styles.logoLine}>
              <Text style={styles.of}>OF</Text>
              <Text style={styles.tickets}>JOY</Text>
            </View>
          </View>
       
        </View>
        <View style={styles.deals}>
          <Text style={styles.welcome}>Welcome to the world of deals!</Text>
          <Text style={styles.instructions}>Tap on continue to import all your</Text>
          <Text style={styles.instructions}>deals and get started</Text>
        </View>
        <View style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffbf00',
    padding: 25
  },
  circle1: {
    width: 330,
    height: 200,
    backgroundColor: '#FFD100',
    borderRadius: 250/2,
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 1,
    alignItems: 'center',
  },
  circle2: {
    width: 280,
    height: 150,
    backgroundColor: '#FFBF00',
    borderRadius: 200/2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
    overflow: 'hidden'
  },
  circle3: {
    width: 120,
    height: 120,
    borderRadius: 150/2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    zIndex: 3,
  },
  circle3Part1: {
    width: 180,
    height: 250,
    backgroundColor: '#FFBF00',
  },
  circle3Part2: {
    width: 100,
    height: 250,
    backgroundColor: '#2D2F3B',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  circle3Part3: {
    width: 150,
    height: 80,
    borderRadius: 80/2,
    backgroundColor: '#fc241c',
    marginLeft: -90,
    marginTop: 100
  },
  logo: {
    flexGrow: 2,
    width: 330,
    height:330,
    borderRadius: 330/2,
    backgroundColor: '#ffbf00',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative'
  },
  logoLeft: {
    width: 250,
    position: 'absolute',
    right: 80,
    paddingTop: 10,
    justifyContent: 'center',
    zIndex: 4,
  },
  logoRight: {
    width: 130,
    height: 250,
    position: 'absolute',
    right: 0,
    backgroundColor: '#1f2a44',
    zIndex: 3
  },
  logoRightShadow: {
    width: 130,
    height: 250,
    position: 'absolute',
    right: 0,
    backgroundColor: '#ffbf00',
  },
  logoLine: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  tickets: {
    fontFamily: 'JMH Cthulhumbus UG',
    fontSize: 40,
    textAlign: 'center',
    color: '#2D2F3B',
    lineHeight: 42,
  },
  of: {
    fontFamily: 'JMH Cthulhumbus UG',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 26,
    color: '#2D2F3B',
  },
  welcome: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#F5FCFF',
  },
  deals: {
    marginBottom: 35
  },
  instructions: {
    textAlign: 'center',
    color: '#F5FCFF',
    marginBottom: 5,
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 18,
    lineHeight: 18
  },
  continueBtn: {
    alignSelf: 'stretch',
    textAlign: 'center',
    height: 50,
    borderRadius: 100/2,
    backgroundColor: '#2D2F3B'
  },
  continueText: {
    textAlign: 'center',
    color: '#F5FCFF',
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 20,
    lineHeight: 50
  }
});
