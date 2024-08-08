import { Provider } from 'react-redux';
import Root from './root';
import { store } from './store';
import './index.css';

function App() {
  return <Provider store={store}>
    <Root />
  </Provider>
}

export default App;
