import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface MonochromeIllustrationProps {
  type: 'latest' | 'categories' | 'reading';
}

export const MonochromeIllustration: React.FC<MonochromeIllustrationProps> = ({ type }) => {
  if (type === 'latest') {
    // Screen 1: Robotic Hand & Human Hand reaching out (Creation of Adam / tech meets humanity)
    return (
      <View style={styles.container}>
        <Svg width="280" height="240" viewBox="0 0 280 240">
          <Defs>
            <LinearGradient id="bgGrad1" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#F5F6F7" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#E5E7EB" stopOpacity="0.4" />
            </LinearGradient>
            <LinearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#2A2D34" />
              <Stop offset="0.5" stopColor="#181A1F" />
              <Stop offset="1" stopColor="#0B0C0E" />
            </LinearGradient>
          </Defs>

          {/* Abstract soft contour background */}
          <Circle cx="140" cy="120" r="100" fill="url(#bgGrad1)" />
          <Circle cx="140" cy="120" r="75" stroke="#E5E7EB" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <Circle cx="140" cy="120" r="50" stroke="#E5E7EB" strokeWidth="0.8" fill="none" />

          {/* Left: Robotic / Cybernetic Hand extending right */}
          <G id="robot-hand">
            {/* Forearm segments */}
            <Path
              d="M 10 70 L 60 85 L 85 92 L 75 105 L 15 90 Z"
              fill="url(#metalGrad)"
            />
            {/* Joint pins */}
            <Circle cx="60" cy="85" r="4" fill="#6B7280" />
            <Circle cx="85" cy="92" r="5" fill="#4B5563" />

            {/* Robot Palm */}
            <Path
              d="M 85 92 L 115 98 L 120 112 L 92 118 Z"
              fill="#1F2329"
            />
            {/* Robot Index finger reaching */}
            <Path
              d="M 115 98 L 132 102 L 144 104 L 142 108 L 130 107 L 118 103 Z"
              fill="#2C3038"
            />
            {/* Robot Thumb */}
            <Path
              d="M 105 112 L 120 124 L 128 127 L 125 131 L 114 127 L 102 118 Z"
              fill="#22252C"
            />
            {/* Robot Other fingers */}
            <Path
              d="M 112 105 L 128 111 L 136 114 L 133 118 L 124 115 L 110 110 Z"
              fill="#1A1C21"
            />
            {/* Pulse glow between fingertips */}
            <Circle cx="150" cy="107" r="5" fill={COLORS.accentBlue} opacity={0.85} />
            <Circle cx="150" cy="107" r="10" stroke={COLORS.accentBlue} strokeWidth="1" opacity={0.3} fill="none" />
          </G>

          {/* Right: Human Hand reaching left */}
          <G id="human-hand">
            {/* Forearm */}
            <Path
              d="M 270 145 L 220 135 L 195 128 L 202 116 L 265 125 Z"
              fill="#374151"
            />
            {/* Wrist / Palm */}
            <Path
              d="M 195 128 L 170 122 L 166 112 L 192 108 Z"
              fill="#4B5563"
            />
            {/* Human index finger reaching towards robot */}
            <Path
              d="M 170 122 L 158 112 L 154 110 L 155 107 L 163 109 L 174 116 Z"
              fill="#1F2937"
            />
            {/* Human other curved fingers */}
            <Path
              d="M 174 125 L 167 132 L 173 138 L 182 132 Z"
              fill="#374151"
            />
          </G>
        </Svg>
      </View>
    );
  }

  if (type === 'categories') {
    // Screen 2: Mobile Interface Mockup with dark categories list
    return (
      <View style={styles.container}>
        <Svg width="280" height="240" viewBox="0 0 280 240">
          <Defs>
            <LinearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F9FAFB" />
              <Stop offset="1" stopColor="#E5E7EB" stopOpacity="0.5" />
            </LinearGradient>
          </Defs>

          {/* Soft background shape */}
          <Rect x="40" y="20" width="200" height="200" rx="30" fill="url(#bgGrad2)" />

          {/* Angled / floating dark mobile frame */}
          <G transform="translate(65, 20)">
            {/* Phone body */}
            <Rect x="0" y="0" width="150" height="200" rx="20" fill="#121316" stroke="#2B2D33" strokeWidth="2" />
            
            {/* Phone notch/island */}
            <Rect x="55" y="6" width="40" height="5" rx="2.5" fill="#25272D" />

            {/* Phone header */}
            <Rect x="15" y="22" width="120" height="22" rx="6" fill="#1D1F24" />
            <Circle cx="26" cy="33" r="3" fill="#6B7280" />
            <SvgText x="36" y="36" fill="#9CA3AF" fontSize="8" fontFamily="sans-serif">
              Trending
            </SvgText>

            {/* Category row 1: Technology */}
            <Rect x="15" y="52" width="120" height="24" rx="6" fill="#1A1C20" />
            <Circle cx="26" cy="64" r="5" fill="#2D3139" />
            <SvgText x="38" y="67" fill="#E5E7EB" fontSize="8" fontWeight="bold">
              Technology
            </SvgText>

            {/* Category row 2: Business */}
            <Rect x="15" y="82" width="120" height="24" rx="6" fill="#1A1C20" />
            <Circle cx="26" cy="94" r="5" fill="#2D3139" />
            <SvgText x="38" y="97" fill="#E5E7EB" fontSize="8" fontWeight="bold">
              Business
            </SvgText>

            {/* Category row 3: FinTech */}
            <Rect x="15" y="112" width="120" height="24" rx="6" fill="#1A1C20" />
            <Circle cx="26" cy="124" r="5" fill="#2D3139" />
            <SvgText x="38" y="127" fill="#E5E7EB" fontSize="8" fontWeight="bold">
              FinTech
            </SvgText>

            {/* Category row 4: Startups */}
            <Rect x="15" y="142" width="120" height="24" rx="6" fill="#1A1C20" />
            <Circle cx="26" cy="154" r="5" fill="#2D3139" />
            <SvgText x="38" y="157" fill="#E5E7EB" fontSize="8" fontWeight="bold">
              Startups
            </SvgText>
          </G>

          {/* Floating badge on the right */}
          <G transform="translate(195, 110)">
            <Rect x="0" y="0" width="36" height="36" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />
            <Circle cx="18" cy="18" r="8" stroke="#111827" strokeWidth="1.5" fill="none" />
            <Circle cx="18" cy="18" r="3" fill="#111827" />
          </G>
        </Svg>
      </View>
    );
  }

  // Screen 3: Mobile article reading view with bookmark badge & Aa typography badge
  return (
    <View style={styles.container}>
      <Svg width="280" height="240" viewBox="0 0 280 240">
        <Defs>
          <LinearGradient id="bgGrad3" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F9FAFB" />
            <Stop offset="1" stopColor="#ECEFF2" />
          </LinearGradient>
        </Defs>

        {/* Backdrop circle */}
        <Circle cx="140" cy="120" r="95" fill="url(#bgGrad3)" />

        {/* Mobile device frame */}
        <G transform="translate(68, 20)">
          {/* Card body */}
          <Rect x="0" y="0" width="144" height="200" rx="18" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          
          {/* Header notch */}
          <Rect x="54" y="6" width="36" height="4" rx="2" fill="#E5E7EB" />

          {/* Article hero image thumbnail */}
          <Rect x="12" y="18" width="120" height="58" rx="6" fill="#1F242D" />
          <Path d="M 20 65 L 45 42 L 70 58 L 95 38 L 125 65 Z" fill="#2E3543" opacity={0.6} />

          {/* Article headline lines */}
          <Rect x="12" y="86" width="90" height="7" rx="3.5" fill="#111827" />
          <Rect x="12" y="98" width="112" height="6" rx="3" fill="#374151" />

          {/* Article paragraph lines */}
          <Rect x="12" y="114" width="120" height="4" rx="2" fill="#9CA3AF" />
          <Rect x="12" y="123" width="115" height="4" rx="2" fill="#D1D5DB" />
          <Rect x="12" y="132" width="108" height="4" rx="2" fill="#D1D5DB" />
          <Rect x="12" y="141" width="118" height="4" rx="2" fill="#E5E7EB" />
          <Rect x="12" y="150" width="80" height="4" rx="2" fill="#E5E7EB" />
        </G>

        {/* Floating Bookmark Pill Top Right */}
        <G transform="translate(196, 45)">
          <Rect x="0" y="0" width="34" height="34" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.2" />
          <Path d="M 12 10 L 22 10 L 22 24 L 17 20 L 12 24 Z" fill="#111827" />
        </G>

        {/* Floating Typography 'Aa' Pill Middle Right */}
        <G transform="translate(202, 115)">
          <Rect x="0" y="0" width="38" height="34" rx="10" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.2" />
          <SvgText x="10" y="22" fill="#111827" fontSize="13" fontWeight="bold" fontFamily="serif">
            Aa
          </SvgText>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
