import {
  // ! TODO: Why we dont use DeviceInfo,
  // DeviceInfo,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';

const { OS, Version } = Platform;
const { height, width } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const fontScale = PixelRatio.getFontScale();
// const { locale, totalMemory } = DeviceInfo;
const { locale = 'en-US', totalMemory = 0, userAgent = '' } = {};
const isTablet = (height > width && width >= 768) || (height < width && width >= 1024);

let deviceManufacturer;
let deviceModel;
let osName;
let osVersion;
let browserName;
let browserVersion;

if (Platform.OS !== 'web') {
  osName = OS === 'android' ? 'Android' : 'iOS';
  osVersion = Version;
}

// -- Determine device ---------------------------------------------------------
if (osName === 'iOS') {
  deviceManufacturer = 'Apple';
  deviceModel = isTablet ? 'iPad' : 'iPhone';
} else if (osName === 'Android') {
  // deviceModel = 'Android';
  deviceModel = isTablet ? 'Android Tablet' : 'Android Phone';
} else if (osName === 'Mac OS X') {
  deviceManufacturer = 'Apple';
  deviceModel = 'Mac';
} else {
  deviceModel = 'Desktop';
}

export const entropy = {
  // Browser
  browserName,
  browserVersion,
  // Device
  deviceManufacturer,
  deviceModel,
  // OS
  osName,
  osVersion,
  // Screen
  height,
  fontScale,
  locale,
  pixelRatio,
  width,
  // Others
  totalMemory,
  userAgent,
};
