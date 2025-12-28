import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface FlareTabIconProps {
  size?: number;
  color?: string;
}

export default function FlareTabIcon({ size = 24, color = '#666' }: FlareTabIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Simplified flame icon for tab bar */}
        <Path
          d="M12 2C8 2 5 5 5 9c0 5.25 3 7 7 7s7-1.75 7-7c0-4-3-7-7-7z"
          fill={color}
          opacity={0.8}
        />
        <Path
          d="M12 4c-2 0-3.5 1.5-3.5 3.5c0 2.5 1.5 3.5 3.5 3.5s3.5-1 3.5-3.5C15.5 5.5 14 4 12 4z"
          fill={color}
        />
        <Path
          d="M12 18c-1 0-2 0.5-2 1.5S11 22 12 22s2-1 2-2.5S13 18 12 18z"
          fill={color}
          opacity={0.6}
        />
      </Svg>
    </View>
  );
}