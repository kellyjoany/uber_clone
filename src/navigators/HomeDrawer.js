import { createDrawerNavigator } from 'react-navigation-drawer';
import CustomDrawer from '../components/CustomDrawer';

import Home from '../screens/Home';

export default createDrawerNavigator({
    Home
}, {
    contentComponent: CustomDrawer
});