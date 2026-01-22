import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressDots({ active = 0, total = 3, style, size = 10 }) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === active ? size * 2.5 : size, // Elongate active dot
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#fff',
              opacity: i === active ? 1 : 0.4
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: { marginHorizontal: 4 }
});
