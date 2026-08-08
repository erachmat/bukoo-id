import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface LogoBukooProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const LogoBukoo: React.FC<LogoBukooProps> = ({ size = 28, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../../assets/logo bukoo.png')}
        style={{ width: size * 3.5, height: size, resizeMode: 'contain' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
