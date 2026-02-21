import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Open Quran book icon */
export const QuranBookIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    {/* Left page */}
    <Path
      d="M12 6.5C10.5 5 8.5 4.5 6 4.5 4.5 4.5 3 5 3 6.5v10c0 1.5 1.5 2 3 2 2.5 0 4.5.5 6 2V6.5z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right page */}
    <Path
      d="M12 6.5c1.5-1.5 3.5-2 6-2 1.5 0 3 .5 3 2v10c0 1.5-1.5 2-3 2-2.5 0-4.5.5-6 2V6.5z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Rub el Hizb — two overlapping squares with center dot, used to mark Juz divisions */
export const RubElHizbIcon = ({ size = 24, color = '#000', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    {/* Upright square */}
    <Path
      d="M7 7h10v10H7z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    {/* Rotated square (diamond) */}
    <Path
      d="M12 4.93L19.07 12L12 19.07L4.93 12Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    {/* Center circle */}
    <Circle cx={12} cy={12} r={2} fill={color} />
  </Svg>
);
