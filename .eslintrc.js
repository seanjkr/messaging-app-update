module.exports = {
  env: {
    'react-native/react-native': true,
  },
  parser: 'babel-eslint',
  extends: 'airbnb',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-native',
  ],
  rules: {
    'react/prop-types': 0,
    'react/destructuring-assignment': 0,
    'arrow-body-style': 0,
    'no-console': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-no-bind': 0,
    'no-use-before-define': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'no-empty': 0,
    'no-useless-return': 0,
    'class-methods-use-this': 0,
    'prefer-const': 0,
  },
};
