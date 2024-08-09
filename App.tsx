// In App.js in a new project
import { enableScreens } from 'react-native-screens';
enableScreens();

import * as React from 'react';
import { View, Text ,Button} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';




const App = () =>{
  return(
<AppNavigator/>

  )
}

export default App