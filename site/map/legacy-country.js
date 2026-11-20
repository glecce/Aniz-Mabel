import { countryAddress, getCountry, getTheme } from './countries.js?v=20261120-11';

const params = new URLSearchParams(location.search);
const country = getCountry(params.get('country') ?? params.get('pais'));
location.replace(country ? countryAddress(country, getTheme(params.get('theme'))) : '/map/');
