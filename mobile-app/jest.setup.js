import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn()
    }),
    useRoute: () => ({
      params: {}
    })
  };
});

// Mock pour PayPal
jest.mock('react-native-paypal-wrapper', () => ({
  PayPalWrapper: {
    initialize: jest.fn(),
    requestOneTimePayment: jest.fn().mockResolvedValue({
      response: {
        state: 'approved',
        id: 'MOCK_ORDER_ID'
      }
    })
  }
}));

// Mock pour Expo
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  requestCameraPermissionsAsync: jest.fn()
}));

jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: 'BarCodeScanner'
}));

// Mocks globaux
global.fetch = jest.fn();
global.alert = jest.fn();

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
