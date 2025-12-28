import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/Colors';

interface FlameIconProps {
  size?: number;
  color?: string;
  style?: any;
}

export default function FlameIcon({ size = 60, color, style }: FlameIconProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color || Colors.primary} />
            <Stop offset="100%" stopColor={color || Colors.secondary} />
          </LinearGradient>
        </Defs>
        
        {/* Main flame shape */}
        <Path
          d="M50 10 C30 20, 20 40, 25 60 C30 75, 45 85, 50 85 C55 85, 70 75, 75 60 C80 40, 70 20, 50 10 Z"
          fill="url(#flameGradient)"
        />
        
        {/* Inner flame detail */}
        <Path
          d="M50 25 C40 30, 35 45, 38 55 C42 65, 48 70, 50 70 C52 70, 58 65, 62 55 C65 45, 60 30, 50 25 Z"
          fill={Colors.white}
          opacity={0.9}
        />
        
        {/* Small inner flame */}
        <Path
          d="M50 35 C45 38, 43 48, 45 52 C47 58, 49 60, 50 60 C51 60, 53 58, 55 52 C57 48, 55 38, 50 35 Z"
          fill={color || Colors.secondary}
          opacity={0.8}
        />
      </Svg>
    </View>
  );
}