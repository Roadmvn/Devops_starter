const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.X:3000/api', // À remplacer par votre IP locale
    paypalEnvironment: 'sandbox'
  },
  prod: {
    apiUrl: 'https://api.supermarche.com/api',
    paypalEnvironment: 'production'
  }
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars;
